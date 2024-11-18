import { version } from '../../package.json';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config } from '../config';
import { queryClient } from './client';
import { useMemo } from 'react';

if (!Config.API_URL) {
  throw new Error('Missing required environment variable: API_URL');
}

import { DefaultApi, Configuration, AuthUser } from '@unconventional-code/avoca-api';

const configuration = new Configuration({
  basePath: Config.API_URL,
});

export const api = new DefaultApi(configuration);

export function useSdk() {
  const apiSdk = useMemo(() => {
    if (!('axios' in api)) {
      throw new Error('The API SDK is missing the axios instance');
    }

    // @ts-ignore
    (api.axios as AxiosInstance).interceptors.request.use(
      (config: InternalAxiosRequestConfig<unknown>) => {
        if (config.url?.includes('auth')) {
          return config;
        }

        const authUser = JSON.parse(localStorage.getItem('user') || '{}') as AuthUser;

        const access_token = authUser.accessToken;
        config.headers['Authorization'] = `Bearer ${access_token}`;
        config.headers['x-app-version'] = version;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // @ts-ignore
    (api.axios as AxiosInstance).interceptors.response.use(
      (response) => {
        return response;
      },
      async function (error) {
        if (!error.config?.url?.includes('auth')) {
          console.error('Error in axios response', error);
          if (error.response.status === 401) {
            const authUser = JSON.parse(localStorage.getItem('user') || '{}') as AuthUser;
            const refreshToken = authUser.refreshToken;
            try {
              const response = await axios.post(`${Config.API_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const { user } = response.data;
              localStorage.setItem('user', JSON.stringify(user));
              // @ts-ignore
              return (api.axios as AxiosInstance)(error.config);
            } catch (error) {
              localStorage.removeItem('user');
              localStorage.clear();
              queryClient.clear();
              console.log('Redirecting to login page');
              window.location.assign(window.location.origin);
              return Promise.reject(error);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return api;
  }, []);

  return apiSdk;
}
