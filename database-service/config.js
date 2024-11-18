if (!process.env.MICROSOFT_SQL_SERVER_HOST) {
  throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_HOST');
}
const mssqlHost = process.env.MICROSOFT_SQL_SERVER_HOST ?? 'localhost';
if (!(typeof process.env.MICROSOFT_SQL_SERVER_USER === 'string')) {
  throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_USER or secret username');
}
const mssqlUser = process.env.MICROSOFT_SQL_SERVER_USER;
if (!(typeof process.env.MICROSOFT_SQL_SERVER_PASSWORD === 'string')) {
  throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_PASSWORD');
}
const mssqlPassword = process.env.MICROSOFT_SQL_SERVER_PASSWORD;
if (!process.env.MICROSOFT_SQL_SERVER_DB) {
  throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_DB');
}
const mssqlDb = process.env.MICROSOFT_SQL_SERVER_DB;
if (!process.env.MICROSOFT_SQL_SERVER_PORT) {
  throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_PORT');
}
const mssqlPort = parseInt(process.env.MICROSOFT_SQL_SERVER_PORT);

module.exports = {
  local: {
    dialect: 'mssql',
    host: mssqlHost,
    port: mssqlPort,
    username: mssqlUser,
    password: mssqlPassword,
    database: mssqlDb,
    logging: false,
  },
  // Dev currently does NOT use an SSH tunnel
  dev: {
    dialect: 'mssql',
    host: mssqlHost,
    port: mssqlPort,
    username: mssqlUser,
    password: mssqlPassword,
    database: mssqlDb,
    logging: false,
  },
  // Prod currently does NOT use an SSH tunnel
  prod: {
    dialect: 'mssql',
    host: mssqlHost,
    port: mssqlPort,
    username: mssqlUser,
    password: mssqlPassword,
    database: mssqlDb,
    logging: false,
  },
};
