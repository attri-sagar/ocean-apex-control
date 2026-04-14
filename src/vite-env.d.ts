/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAWBUDDY_WEBHOOK_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
