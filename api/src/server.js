const { Resend } = require('resend');

const fs = require('fs');
const process = require('node:process');

const defaultschema = require("./db/schema.js");

const express = require('express');
const pino = require('pino');

const app = express();
const logger = pino();

const DB_PATH = "recicladb.sqlite";
const DB_EXISTED = fs.existsSync(DB_PATH);

const db = require('better-sqlite3')(DB_PATH);

if(!DB_EXISTED) {
  db.exec(defaultschema.__RECICLA_DEFAULT_SCHEMA());
}

const API_PORT = process.env.RECICLA_API_PORT || 3000;

const RESEND_SECRET = process.env.RECICLA_RESEND_SECRET || false;

if(!RESEND_SECRET) {
  var errst = "The following environment variables were not provided:";
  
  if(!RESEND_SECRET) errst += '\nRESEND_SECRET';
  
  logger.error(errst);

  process.exit(1);
}

const resend = new Resend(RESEND_SECRET);

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

const ticket_queue = new Tickets();

class Account {
  constructor(email) {
    this.email = email;
    this.id = 0;
    this.name = "402500915_DEFAULT_NAME";

    this.banned = 0;
    this.validated = 0;
  
    this.tokenstring = "EBAD";

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

  __create_token() {
    let toknums = new Uint32Array(4);
    let tok = "";

    crypto.getRandomValues(toknums);
    
    for(let num of toknums) {
      tok += String(num)
    }

    this.tokenstring = tok;
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
    `).run(this.name, this.email);

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
    const { data, error } = await resend.emails.send({
      from: 'ReciclaRP (Não Responda) <reciclarp-naoresponda@comrades.sbs>',
      to: [email],
      subject: 'Seu código de login ReciclaRP',
      html: `Seu código de login é: ${code}.`,
    });

    if (error) {
      return logger.error(`Sending login e-mail to ${email} failed: ${error}`)
    }
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
    this.__create_token();

    return this.tokenstring;
  }

  token_read() {
    return this.tokenstring;
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

app.use(express.json());

// Login e Registro
app.post("/auth/login", (req, res) => {
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
  if(req.body.email && req.body.token) {
    let account = new Account(req.body.email);

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

app.get('/api/ping', (req, res) => {
  res.text("pong!");
});

app.listen(API_PORT, () => {
  console.log(`API running on http://localhost:${API_PORT}`);
});
