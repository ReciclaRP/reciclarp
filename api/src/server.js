const process = require('node:process');
const express = require('express');
const pino = require('pino');

const app = express();
const logger = pino();

const API_PORT = process.env.API_PORT || 3000;
const PG_CONURL = process.env.PG_CONURL || false;

const RESEND_SECRET = process.env.RESEND_SECRET || false;

if(!PG_CONURL || !RESEND_SECRET) {
  var errst = "The following environment variables were not privided:";
  
  if(!PG_CONURL) errst += '\nPG_CONURL';
  if(!RESEND_SECRET) errst += '\nRESEND_SECRET';
  
  logger.error(errst);

  process.exit(1);
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
