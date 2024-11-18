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
  APPLICATION_PORT: number;
  MICROSOFT_SQL_SERVER_HOST: string;
  MICROSOFT_SQL_SERVER_USER: string;
  MICROSOFT_SQL_SERVER_PASSWORD: string;
  MICROSOFT_SQL_SERVER_DB: string;
  MICROSOFT_SQL_SERVER_PORT: number;

  SENDGRID_API_KEY: string;
  SENDGRID_SOURCE_EMAIL_ADDRESS: string;

  CLIENT: string;
  SERVICE: string;

  // Currently unused
  /**
   * @deprecated
   */
  SES_SOURCE_EMAIL_ADDRESS?: never;
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

    if (
      !('MICROSOFT_SQL_SERVER_HOST' in secrets) ||
      typeof secrets.MICROSOFT_SQL_SERVER_HOST !== 'string'
    ) {
      throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_HOST');
    }

    if (
      !('MICROSOFT_SQL_SERVER_USER' in secrets) ||
      typeof secrets.MICROSOFT_SQL_SERVER_USER !== 'string'
    ) {
      throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_USER');
    }

    if (
      !('MICROSOFT_SQL_SERVER_PASSWORD' in secrets) ||
      typeof secrets.MICROSOFT_SQL_SERVER_PASSWORD !== 'string'
    ) {
      throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_PASSWORD');
    }

    if (
      !('MICROSOFT_SQL_SERVER_DB' in secrets) ||
      typeof secrets.MICROSOFT_SQL_SERVER_DB !== 'string'
    ) {
      throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_DB');
    }

    if (
      !('MICROSOFT_SQL_SERVER_PORT' in secrets) ||
      isNaN(parseInt(String(secrets.MICROSOFT_SQL_SERVER_PORT)))
    ) {
      throw new Error('Missing environment variable MICROSOFT_SQL_SERVER_PORT');
    }

    if (!('APPLICATION_PORT' in secrets) || isNaN(parseInt(String(secrets.APPLICATION_PORT)))) {
      throw new Error('Missing environment variable APPLICATION_PORT');
    }

    if (!('ACCESS_TOKEN_SECRET' in secrets) || typeof secrets.ACCESS_TOKEN_SECRET !== 'string') {
      throw new Error('Missing environment variable ACCESS_TOKEN_SECRET');
    }

    if (!('ENV' in secrets) || typeof secrets.ENV !== 'string') {
      throw new Error('Missing environment variable ENV');
    }

    if (!('SENDGRID_API_KEY' in secrets) || typeof secrets.SENDGRID_API_KEY !== 'string') {
      throw new Error('Missing environment variable SENDGRID_API_KEY');
    }
    if (
      !('SENDGRID_SOURCE_EMAIL_ADDRESS' in secrets) ||
      typeof secrets.SENDGRID_SOURCE_EMAIL_ADDRESS !== 'string'
    ) {
      throw new Error('Missing environment variable SENDGRID_SOURCE_EMAIL_ADDRESS');
    }

    if (!('CLIENT' in secrets) || typeof secrets.CLIENT !== 'string') {
      throw new Error('Missing environment variable CLIENT');
    }

    if (!('SERVICE' in secrets) || typeof secrets.SERVICE !== 'string') {
      throw new Error('Missing environment variable SERVICE');
    }

    config = {
      MICROSOFT_SQL_SERVER_HOST: secrets.MICROSOFT_SQL_SERVER_HOST,
      MICROSOFT_SQL_SERVER_USER: secrets.MICROSOFT_SQL_SERVER_USER,
      MICROSOFT_SQL_SERVER_PASSWORD: secrets.MICROSOFT_SQL_SERVER_PASSWORD,
      MICROSOFT_SQL_SERVER_DB: secrets.MICROSOFT_SQL_SERVER_DB,
      MICROSOFT_SQL_SERVER_PORT: parseInt(String(secrets.MICROSOFT_SQL_SERVER_PORT)),
      ACCESS_TOKEN_SECRET: secrets.ACCESS_TOKEN_SECRET,
      ENV: secrets.ENV,
      APPLICATION_PORT: parseInt(String(secrets.APPLICATION_PORT)),
      SENDGRID_API_KEY: secrets.SENDGRID_API_KEY,
      SENDGRID_SOURCE_EMAIL_ADDRESS: secrets.SENDGRID_SOURCE_EMAIL_ADDRESS,
      CLIENT: secrets.CLIENT,
      SERVICE: secrets.SERVICE,
    };

    return config;
  } catch (error) {
    log.error(error, { detail: 'Error getting the configuration' });
    throw error;
  }
}
