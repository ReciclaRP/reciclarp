function __RECICLA_DEFAULT_SCHEMA() {
    return `
    CREATE TABLE user (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,

        banned BOOLEAN NOT NULL,
        validated BOOLEAN NOT NULL
    );
    `;
}

module.exports = {
    __RECICLA_DEFAULT_SCHEMA
}