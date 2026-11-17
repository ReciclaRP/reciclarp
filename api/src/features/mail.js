const environment = require('../environment/envs.js');
const { Resend } = require('resend');

let resend = null;
if(!environment.RESEND_SECRET) {
  logger.error("Environment variable RECICLA_RESEND_SECRET is not set. OTC auth codes will be put to the logs.");
} else {
  resend = new Resend(environment.RESEND_SECRET);
}

module.exports = {
    resend
}