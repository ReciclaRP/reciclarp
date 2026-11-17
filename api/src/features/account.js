const environment = require('../environment/envs.js');

const database = require('../db/database.js');
const mail = require('./mail.js');

class Account {
  constructor(email, token_list, ticket_queue) {
    this.token_list = token_list;
    this.ticket_queue = ticket_queue;

    this.email = email;
    this.id = 0;
    this.name = "402500915_DEFAULT_NAME";

    this.banned = 0;
    this.validated = 0;
  
    this.ong = 0;

    this.real_account = false;

    if(this.__exists()) {
      this.__get_data();
    } else {
      if(this.__email_valid()) {
        this.__create();
      }
    }
  }

  __email_valid() {
    if(String(this.email).match(environment.EMAIL_REGEX)) {
      return true;
    }

    return false;
  }

  __get_data() {
    const data = database.db.prepare(
      'SELECT * FROM user WHERE email = ?'
    ).get(this.email);

    if(data) {
      this.id = data.id;
      this.name = data.uname;
      this.email = data.email;
      this.banned = data.banned;
      this.validated = data.validated;
      this.ong = data.ong;
      this.real_account = true;
    }
  }

  __create() {
    database.db.prepare(`
      INSERT INTO user (uname, email, banned, validated)
      VALUES(?, ?, ?, ?)
    `).run(this.name, this.email, 0, 0);

    this.__get_data();
  }

  __exists() {
    if(database.db.prepare(
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
    database.db.prepare(`
      UPDATE user
      SET uname = ?, email = ?, banned = ?, validated = ?, ong = ?
      WHERE id = ?
    `).run(
      this.name, this.email, this.banned, this.validated, this.ong, this.id
    );
  }

  async __sendverifmail(email, code) {
    if(environment.RESEND_SECRET) {
      const { data, error } = await mail.resend.emails.send({
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

  __delete() {
    database.db.prepare(`
      UPDATE user
      SET uname = ?, email = ?, banned = ?, validated = ?
      WHERE id = ?
    `).run(
      "Deleted User", 
      "deleted-email-recicla@comrades.sbs", 
      0, 
      1,
      this.id
    );
  }

  send_loginmail() {
    if(!this.__is_banned()) {
      const code = this.ticket_queue.new(this.email);
      this.__sendverifmail(this.email, code);
    }
  }

  ban() {
    this.banned = 1;
    this.token_list.invalidate(this.email);

    this.__update();
  }

  delete() {
    if(this.banned != 1) {
      this.__delete();

      return true;
    }

    return false;
  }

  token() {
    return this.token_list.new(this.email);
  }

  token_read() {
    return this.token_list.get(this.email);
  }

  is_ong() {
    if(this.ong) {
      return true;
    }

    return false;
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

  logout() {
    this.token_list.invalidate(this.email);
  }

  make_ong() {
    this.ong = 1;
    this.__update();
  }

  exists() {
    return this.real_account;
  }
}

module.exports = {
    Account
}