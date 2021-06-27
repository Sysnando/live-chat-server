export enum Environment {
  DEV,
  QA,
  PROD,
}

export const ENV = process.env.NODE_ENV == 'production' ? Environment.PROD : Environment.DEV;
