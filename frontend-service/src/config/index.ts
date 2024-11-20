interface ConfigVars {
  API_URL: string;
  WSS_URL: string;
  ENV: 'local' | 'dev' | 'prod';
  CLIENT: string;
  SERVICE: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Config: ConfigVars = {
  API_URL: import.meta.env.VITE_API_URL,
  WSS_URL: import.meta.env.VITE_WSS_URL,
  ENV: import.meta.env.VITE_ENV,
  CLIENT: import.meta.env.VITE_CLIENT,
  SERVICE: import.meta.env.VITE_SERVICE,
};
