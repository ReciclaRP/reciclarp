function __RECICLA_DEFAULT_SCHEMA() {
    return `
        CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uname VARCHAR(120) NOT NULL,
            email VARCHAR(160) NOT NULL UNIQUE,

            banned BOOLEAN NOT NULL DEFAULT 0,
            validated BOOLEAN NOT NULL DEFAULT 0
            ong BOOLEAN NOT NULL DEFAULT 0
        );

        CREATE TABLE point(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pointdescription TEXT NOT NULL,

            lat REAL NOT NULL,
            lon REAL NOT NULL,

            time_open TEXT NOT NULL,
            time_close TEXT NOT NULL,

            accepts_paper BOOLEAN NOT NULL DEFAULT 0,
            accepts_metal BOOLEAN NOT NULL DEFAULT 0,
            accepts_organic BOOLEAN NOT NULL DEFAULT 0,
            accepts_biological BOOLEAN NOT NULL DEFAULT 0

            approved BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY(creator) REFERENCES user(id)
        );
    `;
}

module.exports = {
    __RECICLA_DEFAULT_SCHEMA
}