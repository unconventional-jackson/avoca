import { version } from '../../package.json';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config } from '../config';
import { queryClient } from './client';
import { useMemo } from 'react';
import {
  DefaultApi,
  Configuration as InternalConfiguration,
  AuthUser,
} from '@unconventional-jackson/avoca-internal-api';
import {
  CustomersApi,
  JobsApi,
  Configuration as ExternalConfiguration,
} from '@unconventional-jackson/avoca-external-api';

if (!Config.API_URL) {
  throw new Error('Missing required environment variable: API_URL');
}

const requestInterceptor = (config: InternalAxiosRequestConfig<unknown>) => {
  if (config.url?.includes('auth')) {
    return config;
  }

  const authUser = JSON.parse(localStorage.getItem('user') || '{}') as AuthUser;

  const access_token = authUser.access_token;
  config.headers['Authorization'] = `Bearer ${access_token}`;
  config.headers['x-app-version'] = version;
  return config;
};

const responseInterceptor = async (error: any) => {
  if (!error.config?.url?.includes('auth')) {
    console.error('Error in axios response', error);
    if (error.response.status === 401) {
      try {
        const authUser = JSON.parse(localStorage.getItem('user') || '{}') as AuthUser;
        const response = await axios.post(`${Config.API_URL}/auth/refresh-token`, {
          refresh_token: authUser.refresh_token,
        });

        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        // @ts-ignore
        return (internalApi.axios as AxiosInstance)(error.config);
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
};

const makeApi = <T extends object = CustomersApi | JobsApi | DefaultApi>(api: T): T => {
  if (!('axios' in api)) {
    throw new Error('The API SDK is missing the axios instance');
  }

  // @ts-ignore
  (api.axios as AxiosInstance).interceptors.request.use(requestInterceptor, (error) => {
    return Promise.reject(error);
  });
  // @ts-ignore
  (api.axios as AxiosInstance).interceptors.response.use(
    (response) => response,
    responseInterceptor
  );
  return api;
};

const internalConfiguration = new InternalConfiguration({
  basePath: Config.API_URL,
});

const externalConfiguration = new ExternalConfiguration({
  basePath: Config.API_URL,
});

export function useCustomersSdk() {
  return useMemo(() => {
    const api = new CustomersApi(externalConfiguration);
    return makeApi(api);
  }, []);
}

export function useJobsSdk() {
  return useMemo(() => {
    const api = new JobsApi(externalConfiguration);
    return makeApi(api);
  }, []);
}

export function useAuthSdk() {
  return useMemo(() => {
    const api = new DefaultApi(internalConfiguration);
    return makeApi(api);
  }, []);
}
