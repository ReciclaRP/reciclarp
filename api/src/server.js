import { Resend } from 'resend';

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

const API_PORT = process.env.API_PORT || 3000;

const RESEND_SECRET = process.env.RESEND_SECRET || false;

if(!PG_CONURL || !RESEND_SECRET) {
  var errst = "The following environment variables were not privided:";
  
  if(!PG_CONURL) errst += '\nPG_CONURL';
  if(!RESEND_SECRET) errst += '\nRESEND_SECRET';
  
  logger.error(errst);

  process.exit(1);
}

const resend = new Resend(RESEND_SECRET);

class Tickets {
  constructor() {
    this.tickets = {}
  }

  __newcode() {
    return Math.floor(Math.random()*90000) + 10000;
  }

  new(email) {
    this.tickets[email] = this.__newcode();
    return this.tickets[email];
  }
}

const ticket_queue = Tickets();

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
      this.__create();
    }
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
}

app.use(express.json());

function send_email() {

}

// Login e Registro
app.post("/auth/login", (req, res) = {

});

app.post("/auth/token", (req, res) => {

});

app.get('/api/ping', (req, res) => {
  res.text("pong!");
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
