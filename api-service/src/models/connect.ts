import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { NodeLogger } from '@unconventional-code/observability-sdk';

import { IConfig } from '../utils/secrets';
import { AddressModel } from './models/Addresses';
import { CustomerModel } from './models/Customers';
import { EmployeeModel } from './models/Employees';
import { JobModel } from './models/Jobs';
import { PhoneCallModel } from './models/PhoneCalls';

let sequelize: Sequelize | null = null;

/**
 * MIGRATIONS
 * https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface
 */
export async function getDatabase(config: IConfig, testEnvironment = false) {
  const log = new NodeLogger({ correlation: 'system', name: 'database' });
  log.info('Creating sequelize instance', {
    database_host: config.POSTGRES_HOST,
  });
  try {
    if (!sequelize) {
      sequelize = new Sequelize({
        dialect: PostgresDialect,
        host: config.POSTGRES_HOST,
        port: config.POSTGRES_PORT,
        user: config.POSTGRES_USER,
        password: config.POSTGRES_PASSWORD,
        database: config.POSTGRES_DB,
        logging: false,
        ssl: ['prod', 'dev'].includes(config.ENV)
          ? {
              /**
               * TODO: We want an actual signed certificate in production
               */
              rejectUnauthorized: false,
            }
          : false,
        define: {
          /**
           * Postgres uses underscored naming conventions.
           */
          underscored: true,
        },
        models: [EmployeeModel, JobModel, CustomerModel, AddressModel, PhoneCallModel],
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
