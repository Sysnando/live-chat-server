export enum Environment {
  DEV,
  PROD,
}

export const ENV = process.env.NODE_ENV == 'production' ? Environment.PROD : Environment.DEV;
