import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';

import { Logger } from '../utils/logger';
import { toast } from 'react-toastify';
import { useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';

/**
 * Fetches an access token from the current authenticated user
 * based on the current session. If the token is expired, it will
 * refresh the token and return the new token.
 *
 * This is based on Amplify v5 APIs.
 */
export function useToken() {
  const { signOut } = useAuth();
  return useCallback(async () => {
    const log = new Logger('api.auth');
    try {
      const activeUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      const session = await Auth.currentSession();
      const token = session.getAccessToken();
      const tokenExpiration = token.getExpiration() * 1000;
      if (tokenExpiration < Date.now()) {
        log.info('Token expired, refreshing');
        const refreshToken = session.getRefreshToken();
        const accessToken: string = await new Promise((resolve, reject) => {
          activeUser.refreshSession(refreshToken, (err, refreshedSession: CognitoUserSession) => {
            if (err) {
              log.error(err, { detail: 'Failed to refresh token' });
              reject(err);
            } else {
              log.info('Token refreshed', { ...refreshedSession });
              activeUser.setSignInUserSession(refreshedSession);
              const newToken = refreshedSession.getAccessToken().getJwtToken();
              resolve(newToken);
            }
          });
        });
        return accessToken;
      } else {
        return token.getJwtToken();
      }
    } catch (error) {
      log.error(error, { detail: 'Failed to get token' });
      toast.error('Session expired, please sign in again');
      setTimeout(() => {
        signOut();
      }, 5000);
    }
  }, [signOut]);
}
