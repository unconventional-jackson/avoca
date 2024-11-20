import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { NodeLogger } from '@unconventional-code/observability-sdk';

if (!process.env.ENV) {
  throw new Error('ENV is not set');
}
const stage = process.env.ENV;

export type AWSSecretsManagerPostgresSecret = {
  password?: string;
  dbname?: string;
  engine?: string;
  port?: number;
  dbInstanceIdentifier?: string;
  host?: string;
  username?: string;
};

export interface IConfig {
  ACCESS_TOKEN_SECRET: string;
  ENV: string;
  WEBSOCKET_PORT: number;
  APPLICATION_URL: string;
  CALLS_SERVICE_API_KEY: string;
  CLIENT: string;
  SERVICE: string;
}

let config: IConfig | null;

export async function getConfig(): Promise<IConfig> {
  const log = new NodeLogger({ name: 'utils/secrets' });
  try {
    if (config) {
      log.info('Already have the configuration');
      return config;
    }

    const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' });
    const response = await secretsManagerClient.send(
      new GetSecretValueCommand({
        SecretId: `/${stage}/avoca/api-service`,
      })
    );
    const secrets = JSON.parse(response.SecretString || '{}') as unknown;
    if (typeof secrets !== 'object' || secrets === null) {
      throw new Error('Invalid secrets');
    }

    if (!('WEBSOCKET_PORT' in secrets) || isNaN(parseInt(String(secrets.WEBSOCKET_PORT)))) {
      throw new Error('Missing environment variable WEBSOCKET_PORT');
    }

    if (!('APPLICATION_URL' in secrets) || typeof secrets.APPLICATION_URL !== 'string') {
      throw new Error('Missing environment variable APPLICATION_URL');
    }

    if (
      !('CALLS_SERVICE_API_KEY' in secrets) ||
      typeof secrets.CALLS_SERVICE_API_KEY !== 'string'
    ) {
      throw new Error('Missing environment variable CALLS_SERVICE_API_KEY');
    }

    if (!('ACCESS_TOKEN_SECRET' in secrets) || typeof secrets.ACCESS_TOKEN_SECRET !== 'string') {
      throw new Error('Missing environment variable ACCESS_TOKEN_SECRET');
    }

    if (!('ENV' in secrets) || typeof secrets.ENV !== 'string') {
      throw new Error('Missing environment variable ENV');
    }

    if (!('CLIENT' in secrets) || typeof secrets.CLIENT !== 'string') {
      throw new Error('Missing environment variable CLIENT');
    }

    config = {
      ACCESS_TOKEN_SECRET: secrets.ACCESS_TOKEN_SECRET,
      ENV: secrets.ENV,
      WEBSOCKET_PORT: parseInt(String(secrets.WEBSOCKET_PORT)),
      APPLICATION_URL: secrets.APPLICATION_URL,
      CALLS_SERVICE_API_KEY: secrets.CALLS_SERVICE_API_KEY,
      CLIENT: secrets.CLIENT,
      SERVICE: 'avoca-calls-service',
    };

    return config;
  } catch (error) {
    log.error(error, { detail: 'Error getting the configuration' });
    throw error;
  }
}
