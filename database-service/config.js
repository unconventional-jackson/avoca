if (!process.env.POSTGRES_HOST) {
  throw new Error('Missing environment variable POSTGRES_HOST');
}
const mssqlHost = process.env.POSTGRES_HOST ?? 'localhost';
if (!(typeof process.env.POSTGRES_USER === 'string')) {
  throw new Error('Missing environment variable POSTGRES_USER or secret username');
}
const mssqlUser = process.env.POSTGRES_USER;
if (!(typeof process.env.POSTGRES_PASSWORD === 'string')) {
  throw new Error('Missing environment variable POSTGRES_PASSWORD');
}
const mssqlPassword = process.env.POSTGRES_PASSWORD;
if (!process.env.POSTGRES_DB) {
  throw new Error('Missing environment variable POSTGRES_DB');
}
const mssqlDb = process.env.POSTGRES_DB;
if (!process.env.POSTGRES_PORT) {
  throw new Error('Missing environment variable POSTGRES_PORT');
}
const mssqlPort = parseInt(process.env.POSTGRES_PORT);

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
