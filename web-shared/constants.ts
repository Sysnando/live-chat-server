import {ENV, Environment} from "../web-server/environment";

export const JWT_SECRET = ENV == Environment.PROD ? 'ZTQwZjNhOWVmZmNkYjcxYzM2N2ExZjU0NTEwZTM1YzE1M2I5YzhlNTcyYzg5MzQwNDI2MWQyODQ5NzMyYWM0ZWE2MWZiN2UzMDAxMmI2Mjk5MTJhYjVhMGEyMjAyNTFjMDBkOWE4MzRkZGFhMjdhYzRkYzUzNjM4ZGQ5OGYzM2Q=' : 'ZTQwZjNhOWVmZmNkYjcxYzM2N2ExZjU0NTEwZTM1YzE1M2I5YzhlNTcyYzg5MzQwNDI2MWQyODQ5NzMyYWM0ZWE2MWZiN2UzMDAxMmI2Mjk5MTJhYjVhMGEyMjAyNTFjMDBkOWE4MzRkZGFhMjdhYzRkYzUzNjM4ZGQ5OGYzM2Q=';

export const QUERY_PARAM_EVENT = 'event';
export const QUERY_PARAM_NAME = 'name';
export const QUERY_PARAM_NAME_UNKNOWN = 'unknown$_';
