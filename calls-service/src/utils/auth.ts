import { NodeLogger } from '@unconventional-code/observability-sdk';
import * as jwt from 'jsonwebtoken';

import { getConfig } from './secrets';
/**
 * This is a weak auth implementation for the calls service compared to the stronger auth implementation in the api service.
 *
 * For the calls service, since we have to successfully obtain a JWT before we can even attempt to connect to the websocket, we can assume that the JWT is valid simply by verifying it, no need to validate against the database and jump through hoops.
 *
 * In a real-world scenario, this would not be the case, and we would apply stricter validations.
 */
export async function ensureToken(token: string): Promise<boolean> {
  const log = new NodeLogger({ name: 'utils/auth' });
  try {
    const config = await getConfig();
    const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    if (typeof decodedToken !== 'string' && 'employee_id' in decodedToken) {
      return true;
    }

    throw new Error('Invalid Token');
  } catch (error) {
    log.error(error);
    throw error;
  }
}
