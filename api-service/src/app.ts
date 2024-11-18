import { NodeLogger } from '@unconventional-code/observability-sdk';
import cors from 'cors';
import express, { Express, json } from 'express';

import { correlationMiddleware } from './middlewares/correlation';
import { httpLogger } from './middlewares/httpLogger';
import { getDatabase } from './models/connect';
import { getConfig, IConfig } from './utils/secrets';
import { routes } from './views';

const log = new NodeLogger({ name: 'app' });

let app: Express | null = null;

export async function getExpressApp(config: IConfig, testEnvironment = false) {
  if (!app) {
    app = express();

    //  Connect all our routes to our application
    app.use(httpLogger);
    app.use(correlationMiddleware);
    app.use(cors());
    app.use(json({ limit: '10mb' }));

    app.use('/', routes);

    if (!testEnvironment) {
      const port = config.APPLICATION_PORT;
      app.listen(port, () => {
        log.info(`Server listening on port ${port}`);
      });
    }
  }

  return Promise.resolve(app);
}

export async function main(testEnvironment = false) {
  // First, get the configuration
  log.info('Getting the configuration');
  const config = await getConfig();

  // Connect to the database
  log.info('Connecting to the database');
  await getDatabase(config, testEnvironment);

  // Get the express app
  log.info('Connecting to the express app');
  const expressApp = await getExpressApp(config, testEnvironment);

  log.info('Returning the Express app');
  return expressApp;
}
