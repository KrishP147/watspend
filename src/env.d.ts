interface ImportMetaEnv {
  readonly VITE_EXCHANGE_RATE_API_KEY: string;
  // add other env variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}