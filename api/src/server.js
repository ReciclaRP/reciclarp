const { Resend } = require('resend');

const fs = require('fs');
const process = require('node:process');

const defaultschema = require("./db/schema.js");

const express = require('express');
const pino = require('pino');
const cors = require('cors');

const app = express();
const logger = pino();

const DB_PATH = "recicladb.sqlite";
const DB_EXISTED = fs.existsSync(DB_PATH);

const db = require('better-sqlite3')(DB_PATH);

require('dotenv').config();

const API_PORT = process.env.RECICLA_API_PORT || 3000;
const RESEND_SECRET = process.env.RECICLA_RESEND_SECRET || false;
const WEBAPP_URL = process.env.RECICLA_WEBAPP_URL || 'http://localhost:5173';

app.use(cors({
  origin: WEBAPP_URL,
}));

if(!DB_EXISTED) {
  const ADMIN_EMAIL = process.env.RECICLA_ADMIN_EMAIL || "test@example.com";
  let admseed = defaultschema.__RECICLA_ADMIN_SEED();

  db.exec(defaultschema.__RECICLA_DEFAULT_SCHEMA());

  db.prepare(`
    INSERT INTO user (id, uname, email, banned, validated, ong)
    VALUES(?, ?, ?, ?, ?, ?)
  `).run(0, admseed[0], ADMIN_EMAIL, admseed[1], admseed[2], admseed[3]);

  for(let entry of defaultschema.__RECICLA_POINT_SEED()) {
    db.prepare(`
      INSERT INTO point (pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological, approved, creator)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], entry[6], entry[7], entry[8], entry[9], entry[10]);
  }
}

let resend = null;

if(!RESEND_SECRET) {
  logger.error("Environment variable RECICLA_RESEND_SECRET is not set. OTC auth codes will be put to the logs.");
} else {
  resend = new Resend(RESEND_SECRET);
}

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class Tickets {
  constructor() {
    this.tickets = {}
  }

  __newcode() {
    return String(Math.floor(Math.random()*90000) + 10000);
  }

  new(email) {
    this.tickets[email] = this.__newcode();
    return this.tickets[email];
  }

  get(email) {
    if(email in this.tickets) {
      return this.tickets[email];
    } else {
      return false;
    }
  }
}

class Tokens {
  constructor() {
    this.tokens = {};
  }

  __newtoken() {
    let toknums = new Uint32Array(4);
    let tok = "";

    crypto.getRandomValues(toknums);
    
    for(let num of toknums) {
      tok += String(num)
    }

    return tok;
  }

  new(email) {
    this.tokens[email] = this.__newtoken();
    return this.tokens[email];
  }

  get(email) {
    if(email in this.tokens) {
      return this.tokens[email];
    } else {
      return false;
    }    
  }
}

const ticket_queue = new Tickets();
const token_list = new Tokens();

class Account {
  constructor(email) {
    this.email = email;
    this.id = 0;
    this.name = "402500915_DEFAULT_NAME";

    this.banned = 0;
    this.validated = 0;
  
    this.real_account = false;

    if(this.__exists()) {
      this.__get_data();
    } else {
      if(this.__email_valid()) {
        this.__create();
      } else {
        this.ban();
      }
    }
  }

  __email_valid() {
    if(String(this.email).match(EMAIL_REGEX)) {
      return true;
    }

    return false;
  }

  __get_data() {
    const data = db.prepare(
      'SELECT * FROM user WHERE email = ?'
    ).get(this.email);

    if(data) {
      this.id = data.id;
      this.name = data.name;
      this.email = data.email;
      this.banned = data.banned;
      this.validated = data.validated;
      this.real_account = true;
    }
  }

  __create() {
    db.prepare(`
      INSERT INTO user (name, email, banned, validated)
      VALUES(?, ?, ?, ?)
    `).run(this.name, this.email, 0, 0);

    this.__get_data();
  }

  __exists() {
    if(db.prepare(
      'SELECT * FROM user WHERE email = ?'
    ).get(this.email)) {
      return true;
    }

    return false;
  }

  __is_banned() {
    if(this.banned) {
      return true;
    }

    return false;
  }

  __is_validated() {
    if(this.validated) {
      return true;
    }

    return false;
  }

  __update() {
    db.prepare(`
      UPDATE user
      SET name = ?, email = ?, banned = ?, validated = ?
      WHERE id = ?
    `).run(
      this.name, this.email, this.banned, this.validated
    );
  }

  async __sendverifmail(email, code) {
    if(RESEND_SECRET) {
      const { data, error } = await resend.emails.send({
        from: 'ReciclaRP (Não Responda) <reciclarp-naoresponda@comrades.sbs>',
        to: [email],
        subject: 'Seu código de login ReciclaRP',
        html: `Seu código de login é: ${code}.`,
      });

      if (error) {
        return logger.error(`Sending login e-mail to ${email} failed: ${error}`)
      }
    } else {
      logger.error(`RECICLA_RESEND_SECRET is not available. The login code for ${email} was ${code}.`);
    }

    return true;
  }

  send_loginmail() {
    if(!this.__is_banned()) {
      const code = ticket_queue.new(this.email);
      this.__sendverifmail(this.email, code);
    }
  }

  ban() {
    this.banned = 1;
    this.__update();
  }

  token() {
    return token_list.new(this.email);
  }

  token_read() {
    return token_list.get(this.email);
  }

  get_email() {
    return this.email;
  }

  get_name() {
    return this.name;
  }

  get_id() {
    return this.id;
  }
}

function get_point_list() {
    const data = db.prepare(
      'SELECT * FROM point;'
    ).all();

    return data;
}

app.use(express.json());

// Login e Registro
app.post("/auth/login", (req, res) => {
  logger.info(`Route "/auth/login" triggered.`);

  if(req.body.email) {
    var account = new Account(req.body.email);

    if(account.__is_banned()) {
      res.json({
        type: "error",

        description: "The e-mail provided was unactionable."
      });
    } else {
      account.send_loginmail();

      res.json({
        type: "okay",

        description: "Action has been taken."
      })
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
    if(ticket_queue.get(req.body.email) == req.body.code) {
      let account = new Account(req.body.email);

      res.json({
        type: "okay",
        token: account.token()
      });
    } else {
      res.json({
        type: "error",

        description: "Incorrect code."
      })
    }
  } else {
    res.json({
      type: "error",

      description: "Malformed request."
    })
  }
});

app.post("/auth/check", (req, res) => {
  logger.info(`Route "/auth/check" triggered.`);

  if(req.body.email && req.body.token) {
    let account = new Account(req.body.email);

    console.log(account.token_read());
    console.log(req.body.token);

    if(account.token_read() == req.body.token) {
      res.json({
        type: "okay",

        email: account.get_email(),
        name: account.get_name(),
        id: account.get_id(),
        banned: account.__is_banned()
      });
    } else {
      res.json({
        type: "error",

        description: "Incorrect authentication information was provided."
      })
    }
  } else {
    res.json({
      type: "error",

      description: "Malformed request"
    });
  }
});

app.post("/point/list", (req, res) => {
  logger.info(`Route "/point/list" triggered.`);

  res.json(get_point_list());
});

app.get('/api/ping', (req, res) => {
  logger.info(`Route "/api/ping" triggered.`);

  res.text("pong!");
});

app.listen(API_PORT, () => {
  console.log(`API running on http://localhost:${API_PORT}`);
});
