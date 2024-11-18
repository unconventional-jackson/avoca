interface ConfigVars {
  API_URL: string;
  WS_URL: string;
  ENV: 'local' | 'dev' | 'prod';
  CLIENT: string;
  SERVICE: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Config: ConfigVars = {
  API_URL: 'http://localhost:4000',
  WS_URL: 'http://localhost:8080',
  ENV: import.meta.env.VITE_ENV,
  CLIENT: import.meta.env.VITE_CLIENT,
  SERVICE: import.meta.env.VITE_SERVICE,
};
