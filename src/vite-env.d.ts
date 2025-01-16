/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_S3_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
