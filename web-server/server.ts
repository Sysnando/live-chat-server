import consoleStamp from "console-stamp";
import express from 'express';
import * as http from "http";
import * as cron from 'node-cron';
import * as path from "path";
import {IOServer} from "./io/io-server";
import {ENV, Environment} from "./environment";

// Configure logging
consoleStamp(console, { label: true, pattern: 'yyyy-mm-dd HH:MM:ss' });

// Configure Express MIME Types
express.static.mime.define({ 'wasm': ['application/wasm'] }, true);

const APP = express();
      APP.use('/', express.static('dist/web'))
      APP.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

      // Redirect all non-file unrecognized routes to index.html, in order to support Angular html5mode routes
      APP.get(/^[^.]*$/, (req, res) => res.sendFile(path.resolve('dist/web/index.html')));

const CORS_ORIGIN = ['https://app.ushowme.tv', 'https://qua-app.ushowme.tv', 'http://localhost:9000'];


const HTTP_PORT = ENV == Environment.PROD ? 80 : 8080;
const HTTP = http.createServer(APP);
      HTTP.listen(HTTP_PORT);
      HTTP.on('error', error => console.error(error));
      HTTP.on('listening', () => console.log(`HTTP listening on ${ HTTP_PORT }`));

const IO = IOServer.INSTANCE(HTTP);

// Scheduler
cron.schedule('0 */2 * * * *', () => IO.update$chat$log()); // Every 2 minutes
cron.schedule('0 * * * * *', () => IO.update$chat$room()); // Every minute
cron.schedule('0 * * * * *', () => IO.update$chat$size()); // Every minute

cron.schedule('* * * * * *', () => IO.update$queue()); // Every second

