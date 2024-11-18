import { Sequelize } from '@sequelize/core';
import { MsSqlDialect } from '@sequelize/mssql';
import { NodeLogger } from '@unconventional-code/observability-sdk';

import { IConfig } from '../utils/secrets';
import { UserModel } from './models/Users';

let sequelize: Sequelize | null = null;

/**
 * MIGRATIONS
 * https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface
 */
export async function getDatabase(config: IConfig, testEnvironment = false) {
  const log = new NodeLogger({ correlation: 'system', name: 'database' });
  log.info('Creating sequelize instance', {
    database_host: config.MICROSOFT_SQL_SERVER_HOST,
  });
  try {
    if (!sequelize) {
      sequelize = new Sequelize({
        dialect: MsSqlDialect,
        server: config.MICROSOFT_SQL_SERVER_HOST,
        port: config.MICROSOFT_SQL_SERVER_PORT,
        authentication: {
          type: 'default',
          options: {
            userName: config.MICROSOFT_SQL_SERVER_USER,
            password: config.MICROSOFT_SQL_SERVER_PASSWORD,
          },
        },
        database: 'master', // config.MICROSOFT_SQL_SERVER_DB,
        logging: false,
        trustServerCertificate: true,
        define: {
          /**
           * Postgres uses underscored naming conventions.
           */
          underscored: true,
        },
        models: [UserModel],
      });

      log.info('Connecting to the database...');
      await sequelize.authenticate();
      log.info('Connected to the database');

      if (testEnvironment) {
        await sequelize.sync({
          // force: true,
          alter: true,
        });
        log.info('Tables synchronized');
      }
    }

    return sequelize;
  } catch (error) {
    log.error(error);
    throw error;
  }
}
