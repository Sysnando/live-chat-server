import {ENV, Environment} from "../web-server/environment";

export const JWT_SECRET = ENV == Environment.PROD ? 'e40f3a9effcdb71c367a1f54510e35c153b9c8e572c893404261d2849732ac4ea61fb7e30012b629912ab5a0a220251c00d9a834ddaa27ac4dc53638dd98f33d' : 'e40f3a9effcdb71c367a1f54510e35c153b9c8e572c893404261d2849732ac4ea61fb7e30012b629912ab5a0a220251c00d9a834ddaa27ac4dc53638dd98f33d';

export const QUERY_PARAM_EVENT = 'event';
export const QUERY_PARAM_NAME = 'name';
