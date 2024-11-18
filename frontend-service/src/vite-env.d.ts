/// <reference types="vite/client" />

/**
 * https://vitejs.dev/guide/env-and-mode.html#env-files
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: 'local' | 'dev' | 'prod';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
