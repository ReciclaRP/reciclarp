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

  __update() {
  
  }

  send_loginmail() {

  }

  ban() {

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
