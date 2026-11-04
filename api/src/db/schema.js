function __RECICLA_DEFAULT_SCHEMA() {
    return `
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
    `;
}

function __RECICLA_ADMIN_SEED() {
    return ["Admin", 0, 1, 1];
}

function __RECICLA_POINT_SEED() {
    return [
        ["Ecoponto 1 - Alexandre Balbo",                -21.12599738837306,     -47.82833942883587,     "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 2 - Jardim Centenário",              -21.19118814889186,     -47.83668633446892,     "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 3 - Jardim Santos Dumont",           -21.133463505837554,    -47.7775193933119,      "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 4 - Jardim das Palmeiras II",        -21.186828357560497,    -47.742159908459975,    "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 5 - Jardim Paiva",                   -21.152949679490266,    -47.841838468634236,    "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 6 - Jardim São Fernando",            -21.272251456099387,    -47.8146350209524,      "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 7 - Adelino Semioni",                -21.11835626123413,     -47.801027534177855,    "7:00", "19:00", 1, 1, 0, 0, 1, 0],
        ["Ecoponto 8 - Jardim Diva Tarlá de Carvalho",  -21.13065783047139,     -47.74219426140682,     "7:00", "19:00", 1, 1, 0, 0, 1, 0]
    ];
}

module.exports = {
    __RECICLA_DEFAULT_SCHEMA,
    __RECICLA_POINT_SEED,
    __RECICLA_ADMIN_SEED
}