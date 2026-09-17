function __RECICLA_DEFAULT_SCHEMA() {
    return `
        CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,

        banned BOOLEAN NOT NULL DEFAULT 0,
        validated BOOLEAN NOT NULL DEFAULT 0
        );
    `;
}

module.exports = {
    __RECICLA_DEFAULT_SCHEMA
}