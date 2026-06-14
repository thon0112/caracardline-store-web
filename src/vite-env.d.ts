/// <reference types="vite/client" />

import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    inert?: "" | undefined;
  }
}

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
