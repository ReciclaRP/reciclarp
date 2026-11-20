const fs = require('fs');

const environment = require('../environment/envs.js');

const defaultschema = require("./schema.js");

const DB_EXISTED = fs.existsSync(environment.DB_PATH);

const db = require('better-sqlite3')(environment.DB_PATH);
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

module.exports = {
    db
}