interface ConfigVars {
  API_URL: string;
  ENV: 'local' | 'dev' | 'prod';
  CLIENT: string;
  SERVICE: string;
  APPLICATION: 'admin' | 'operator' | 'user';
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Config: ConfigVars = {
  APPLICATION: import.meta.env.VITE_APPLICATION,
  API_URL: 'http://localhost:4000',
  ENV: import.meta.env.VITE_ENV,
  CLIENT: import.meta.env.VITE_CLIENT,
  SERVICE: import.meta.env.VITE_SERVICE,
};
