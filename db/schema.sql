-- schema.sql
-- Equipe: Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes (RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
-- PostgreSQL 15+
 
-- TODO: CRIAR UMA SCRIPT PARA INCLUIR
-- ESTE ARQUIVO EM SRC/DB/SCHEMA.JS!

CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,

  banned BOOLEAN NOT NULL,
  validated BOOLEAN NOT NULL
);