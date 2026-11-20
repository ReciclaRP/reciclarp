const crypto = require("crypto");

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

  invalidate(email) {
    if(email in this.tokens) {
      delete this.tokens[email];
    }
  }
}

module.exports = {
    Tokens
}