const errormessages = require("./responses/errormessages.js");

const express = require('express');
const pino = require('pino');
const cors = require('cors');
const xss = require("xss");

const app = express();
const logger = pino();

require('dotenv').config();

const environment = require('./environment/envs.js');
const database = require('./db/database.js');
const tickets = require('./features/tickets.js');
const tokens = require('./features/tokens.js');
const accounts = require('./features/account.js');
const points = require('./features/point.js');

const ratelimits = require('express-rate-limit');

app.use(cors({
  origin: environment.WEBAPP_URL,
}));

app.set("trust proxy", Number(environment.PROXY_NO));

const general_limiter = ratelimits.rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56
});

const expensive_stuff_limiter = ratelimits.rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 1, // Limit each IP to 1 request per `window` (here, per 2 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 48
});

const points_limiter = ratelimits.rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 1, // Limit each IP to 1 request per `window` (here, per 2 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 48
});

const tokengen_limiter = ratelimits.rateLimit({
	windowMs: 1 * 60 * 1000,
	limit: 1,
	standardHeaders: 'draft-8', 
	legacyHeaders: false,
	ipv6Subnet: 48
});

app.use(general_limiter);
app.use('/auth/login', expensive_stuff_limiter);
app.use('/auth/token', tokengen_limiter);
app.use('/point/create', points_limiter);
app.use('/point/update', points_limiter);

app.disable('x-powered-by');

function bton(b) {
  if(b == true) return 1;
  return 0;
}

const ticket_queue = new tickets.Tickets();
const token_list = new tokens.Tokens();

function get_point_list() {
    const data = database.db.prepare(
      'SELECT * FROM point;'
    ).all();

    return data;
}

app.use(express.json());

// Login e Registro
app.post("/auth/login", (req, res) => {
  logger.info(`Route "/auth/login" triggered.`);

  if(req.body.email) {
    var account = new accounts.Account(req.body.email, token_list, ticket_queue);

    if(account.__is_banned()) {
      res.json({
        type: "error",

        description: "The e-mail provided was unactionable."
      });
    } else {
      if(account.exists()) {
        account.send_loginmail();

        res.json({
          type: "okay",

          description: "Action has been taken."
        })
      } else {
        res.json({
          type: "error",

          description: "The account does not exist and could not be created. Did you use a real e-mail address?"
        });
      }
    } 
  } else {
    res.json({
      type: "error",

      description: "Malformed request."
    })
  }
});

app.post("/auth/token", (req, res) => {
  logger.info(`Route "/auth/token" triggered.`);

  if(req.body.email && req.body.code) {
    if(ticket_queue.get(req.body.email) === req.body.code) {
      let account = new accounts.Account(req.body.email, token_list, ticket_queue);

      res.json({
        type: "okay",
        token: account.token()
      });
    } else {
      res.json(errormessages.res_error_text("BADCODE"));
    }
  } else {
    res.json(errormessages.res_error_text("MALFORMED"));
  }
});

app.post("/auth/check", (req, res) => {
  logger.info(`Route "/auth/check" triggered.`);

  if(req.body.email && req.body.token) {
    let account = new accounts.Account(req.body.email, token_list, ticket_queue);

    if(account.token_read() === req.body.token) {
      res.json({
        type: "okay",

        email: account.get_email(),
        name: account.get_name(),
        id: account.get_id(),
        banned: account.__is_banned(),
        ong: account.is_ong()
      });
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("MALFORMED"));
  }
});

app.post("/auth/delete", (req, res) => {
  logger.info(`Route "/auth/delete" triggered.`);

  if(req.body.email && req.body.token) {
    let account = new accounts.Account(req.body.email, token_list, ticket_queue);

    if(account.token_read() === req.body.token) {
      const success = account.delete();

      if(success){
        res.json({
          type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("MAYBEBANNED"));
      }
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("MALFORMED"));
  }
});

app.post("/auth/logout", (req, res) => {
  logger.info(`Route "/auth/logout" triggered.`);

  if(req.body.email && req.body.token) {
    let account = new accounts.Account(req.body.email, token_list, ticket_queue);

    if(account.token_read() === req.body.token) {
      account.logout();

      res.json({
        type: "okay"
      });
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("MALFORMED"));
  }
});

app.post("/auth/special", (req, res) => {
  logger.info(`Route "/auth/special" triggered.`);

  if(req.body.email && req.body.token) {
    let account = new accounts.Account(req.body.email, token_list, ticket_queue);

    if(account.token_read() === req.body.token) {
      if(req.body.code === environment.ESCALATION_TOKEN){
        if(!account.is_ong()) {
          account.make_ong();
        }
        
        res.json({
          type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("REDEEMINCORRECT"));
      }
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("MALFORMED"));
  }
});

app.post("/point/list", (req, res) => {
  logger.info(`Route "/point/list" triggered.`);

  res.json(get_point_list());
});

app.post("/point/create", (req, res) => {
  logger.info(`Route "/point/create" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.data &&
      req.body.data.pointdescription &&
      req.body.data.lati &&
      req.body.data.long &&
      req.body.data.time_open &&
      req.body.data.time_close &&
      req.body.data.accepts_paper != undefined &&
      req.body.data.accepts_metal != undefined &&
      req.body.data.accepts_organic != undefined &&
      req.body.data.accepts_biological != undefined
    ) {
      let autoapproved = false;
      let user_account = new accounts.Account(req.body.email, token_list, ticket_queue);
      let point = new points.Point();

      if(user_account.is_ong()) {
        autoapproved = true;
      }

      point.new(
        xss.filterXSS(
          String(
            req.body.data.pointdescription
          ).substring(0, environment.MAX_POINTDESCRIPTION_LEN)
        ), 
        req.body.data.lati,
        req.body.data.long, 
        req.body.data.time_open,
        req.body.data.time_close,
        bton(req.body.data.accepts_paper),
        bton(req.body.data.accepts_metal),
        bton(req.body.data.accepts_organic),
        bton(req.body.data.accepts_biological),
        bton(autoapproved),
        user_account.get_id()
      )

      res.json({
        type: "okay"
      });
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

// TODO: User edit history
app.post("/point/update", (req, res) => {
  logger.info(`Route "/point/update" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    let user_account = new accounts.Account(req.body.email, token_list, ticket_queue);
    if(user_account.is_ong()) {
      let point = new points.Point();

      if(point.read_from_pid(req.body.data.pid)) {
        if(req.body.data &&
          req.body.data.pointdescription &&
          req.body.data.lati &&
          req.body.data.long &&
          req.body.data.time_open &&
          req.body.data.time_close &&
          req.body.data.accepts_paper != undefined &&
          req.body.data.accepts_metal != undefined &&
          req.body.data.accepts_organic != undefined &&
          req.body.data.accepts_biological != undefined
        ) {
          point.update(
            xss.filterXSS(
              String(
                req.body.data.pointdescription
              ).substring(0, environment.MAX_POINTDESCRIPTION_LEN)
            ), 
            req.body.data.lati,
            req.body.data.long, 
            req.body.data.time_open,
            req.body.data.time_close,
            bton(req.body.data.accepts_paper),
            bton(req.body.data.accepts_metal),
            bton(req.body.data.accepts_organic),
            bton(req.body.data.accepts_biological)
          );

          res.json({
            type: "okay"
          });
        } else {
          res.json(errormessages.res_error_text("NOTENOUGHDATA"));
        }
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

// TODO: User edit history
app.post("/point/remove", (req, res) => {
  logger.info(`Route "/point/remove" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    let user_account = new accounts.Account(req.body.email, token_list, ticket_queue);
    if(user_account.is_ong()) {
      let point = new points.Point();

      if(point.read_from_pid(req.body.data.pid)) {
        point.delete();

        res.json({
          type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/point/approve", (req, res) => {
  logger.info(`Route "/point/approve" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    let user_account = new accounts.Account(req.body.email, token_list, ticket_queue);
    if(user_account.is_ong()) {
      let point = new points.Point();

      if(point.read_from_pid(req.body.data.pid)) {
        point.approve();

        res.json({
          type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("INCORRECTAUTH"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/point/access/log", (req, res) => {
  logger.info(`Route "/point/access/log" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.pid != undefined) {
      let account = new accounts.Account(req.body.email, token_list, ticket_queue);
      let point = new points.Point();

      if(point.read_from_pid(req.body.pid)) {
        point.log_access(account.get_id());
        
        res.json({
          type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/point/access/get", (req, res) => {
  logger.info(`Route "/point/access/get" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.pid != undefined && req.body.no) {
      let account = new accounts.Account(req.body.email, token_list, ticket_queue);
      if(account.is_ong()) {
        let point = new points.Point();

        if(point.read_from_pid(req.body.pid)) {
          let data = point.get_accesses(Number(req.body.no));
          
          res.json({
            type: "okay",
            data: data
          });
        } else {
          res.json(errormessages.res_error_text("DATANOTEXIST"));
        }
      } else {
        res.json(errormessages.res_error_text("INCORRECTAUTH"));
      }
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/point/access/no", (req, res) => {
  logger.info(`Route "/point/access/no" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.pid != undefined) {
      let account = new accounts.Account(req.body.email, token_list, ticket_queue);
      if(account.is_ong()) {
        let point = new points.Point();

        if(point.read_from_pid(req.body.pid)) {
          let data = point.times_accessed();
          
          res.json({
            type: "okay",
            data: data
          });
        } else {
          res.json(errormessages.res_error_text("DATANOTEXIST"));
        }
      } else {
        res.json(errormessages.res_error_text("INCORRECTAUTH"));
      }
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/report/create", (req, res) => {
  logger.info(`Route "/report/create" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.description && req.body.problem_kind && req.body.pid) {
      const account = new accounts.Account(req.body.email, token_list, ticket_queue);
      
      const point = new points.Point();
      if(point.read_from_pid(req.body.pid)) {
        point.create_report(
          req.body.description,
          req.body.problem_kind,
          account.id
        );

        res.json({
            type: "okay"
        });
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.post("/report/getlist", (req, res) => {
  logger.info(`Route "/report/getlist" triggered.`);

  if(token_list.get(req.body.email) === req.body.token) {
    if(req.body.description && req.body.problem_kind && req.body.pid) {
      const point = new points.Point();
      if(point.read_from_pid(req.body.pid)) {
        let data = point.get_reports();

        if(data) {
          res.json({
              type: "okay",
              data: data
          });
        } else {
          res.json(errormessages.res_error_text("DATANOTEXIST"));
        }
      } else {
        res.json(errormessages.res_error_text("DATANOTEXIST"));
      }
    } else {
      res.json(errormessages.res_error_text("NOTENOUGHDATA"));
    }
  } else {
    res.json(errormessages.res_error_text("INCORRECTAUTH"));
  }
});

app.get('/api/ping', (req, res) => {
  logger.info(`Route "/api/ping" triggered.`);

  res.json({
    ip: req.ip,
    ips: req.ips,
    socket: req.socket.remoteAddress,
    xff: req.headers['x-forwarded-for'],
    cfIp: req.headers['cf-connecting-ip'],
  });
});

setInterval(() => {
  ticket_queue.purge();
}, 60000);

app.listen(environment.API_PORT, 'localhost', () => {
  console.log(`API running on http://localhost:${environment.API_PORT}`);
});
