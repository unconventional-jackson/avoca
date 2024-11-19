if (!process.env.POSTGRES_HOST) {
  throw new Error('Missing environment variable POSTGRES_HOST');
}
const host = process.env.POSTGRES_HOST ?? 'localhost';
if (!(typeof process.env.POSTGRES_USER === 'string')) {
  throw new Error('Missing environment variable POSTGRES_USER or secret username');
}
const username = process.env.POSTGRES_USER;
if (!(typeof process.env.POSTGRES_PASSWORD === 'string')) {
  throw new Error('Missing environment variable POSTGRES_PASSWORD');
}
const password = process.env.POSTGRES_PASSWORD;
if (!process.env.POSTGRES_DB) {
  throw new Error('Missing environment variable POSTGRES_DB');
}
const database = process.env.POSTGRES_DB;
if (!process.env.POSTGRES_PORT) {
  throw new Error('Missing environment variable POSTGRES_PORT');
}
const port = parseInt(process.env.POSTGRES_PORT);

module.exports = {
  local: {
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
  },
  // Dev currently does NOT use an SSH tunnel
  dev: {
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
  },
  // Prod currently does NOT use an SSH tunnel
  prod: {
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
  },
};
