const environment = require('../environment/envs.js');

const crypto = require("crypto");

class Tickets {
  constructor() {
    this.tickets = {};
    this.ticket_creation_times = {};
  }

  __newcode() {
    return String(crypto.randomInt(100000, 1000000));
  }

  new(email) {
    this.tickets[email] = this.__newcode();
    this.ticket_creation_times[email] = new Date();

    return this.tickets[email];
  }

  purge() {
    for(let email in this.ticket_creation_times) {
      if(email in this.tickets){
        let date_created = this.ticket_creation_times[email];

        let difference_min = Math.floor(
          Math.abs(
            date_created - new Date()
          ) / 1000 / 60
        );

        if(difference_min > environment.OTC_DURATION) {
          delete this.tickets[email];
          delete this.ticket_creation_times[email];
        }
      } else {
        delete this.ticket_creation_times[email];
      }
    }
  }

  get(email) {
    this.purge();

    if(email in this.tickets) {
      let ret = this.tickets[email];

      delete this.tickets[email];
      delete this.ticket_creation_times[email];

      return ret;
    } else {
      return false;
    }
  }
}

module.exports = {
    Tickets
}