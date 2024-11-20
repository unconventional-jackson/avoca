import { Configuration, DefaultApi } from '@unconventional-jackson/avoca-internal-api';
import { InternalAxiosRequestConfig } from 'axios';

import { getConfig } from './secrets';

// Initialize the external API SDK
let callsSdk: DefaultApi | null;
export async function getCallsSdk() {
  if (!callsSdk) {
    const config = await getConfig();
    callsSdk = new DefaultApi(
      new Configuration({
        basePath: config.APPLICATION_URL,
      })
    );

    if (!('axios' in callsSdk)) {
      throw new Error('The API SDK is missing the axios instance');
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    callsSdk.axios.interceptors.request.use(
      (axiosConfig: InternalAxiosRequestConfig<unknown>) => {
        axiosConfig.headers['x-api-key'] = config.CALLS_SERVICE_API_KEY;
        return axiosConfig;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );
  }
  if (!callsSdk) {
    throw new Error('Failed to initialize SDK');
  }
  return callsSdk;
}
