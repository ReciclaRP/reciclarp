-- schema.sql
-- Equipe: Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes (RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
-- PostgreSQL 15+
 
-- TODO: CRIAR UMA SCRIPT PARA INCLUIR
-- ESTE ARQUIVO EM SRC/DB/SCHEMA.JS!

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uname VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,

    banned BOOLEAN NOT NULL DEFAULT 0,
    validated BOOLEAN NOT NULL DEFAULT 0,
    ong BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE point (
    pid INTEGER PRIMARY KEY AUTOINCREMENT,
    pointdescription TEXT NOT NULL,

    lati REAL NOT NULL,
    long REAL NOT NULL,

    time_open TEXT NOT NULL,
    time_close TEXT NOT NULL,

    accepts_paper BOOLEAN NOT NULL DEFAULT 0,
    accepts_metal BOOLEAN NOT NULL DEFAULT 0,
    accepts_organic BOOLEAN NOT NULL DEFAULT 0,
    accepts_biological BOOLEAN NOT NULL DEFAULT 0,

    approved BOOLEAN NOT NULL DEFAULT 0,
    creator INTEGER NOT NULL,
    FOREIGN KEY(creator) REFERENCES user(id)
);

CREATE TABLE report (
  rid INTEGER PRIMARY KEY AUTOINCREMENT,
  reportdescription TEXT NOT NULL,

  category_noexist BOOLEAN NOT NULL DEFAULT 0,
  category_full BOOLEAN NOT NULL DEFAULT 0,
  category_badtime BOOLEAN NOT NULL DEFAULT 0,

  uid INTEGER NOT NULL,
  pid INTEGER NOT NULL,

  FOREIGN KEY(uid) REFERENCES user(id),
  FOREIGN KEY(pid) REFERENCES point(pid)
);