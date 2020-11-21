import consoleStamp from "console-stamp";
import express from 'express';
import * as http from "http";
import * as cron from 'node-cron';
import * as path from "path";
import {IOServer} from "./io/io-server";

// Configure logging
consoleStamp(console, { label: true, pattern: 'yyyy-mm-dd HH:MM:ss' });

const APP = express();
      APP.use('/', express.static('dist/web'))
      APP.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

      // Redirect all non-file unrecognized routes to index.html, in order to support Angular html5mode routes
      APP.get(/^[^.]*$/, (req, res) => res.sendFile(path.resolve('dist/web/index.html')));

const HTTP_PORT = 8080; // TODO: different port for DEV and PROD
const HTTP = http.createServer(APP);
      HTTP.listen(HTTP_PORT);
      HTTP.on('error', error => console.error(error));
      HTTP.on('listening', () => console.log(`HTTP listening on ${ HTTP_PORT }`));

// TODO: HTTPS w/ letsencrypt

const IO = IOServer.INSTANCE(HTTP);

// Scheduler
cron.schedule('0 */2 * * * *', () => IO.update$chat$log()); // Every 2 minutes
cron.schedule('0 * * * * *', () => IO.update$chat$room()); // Every minute
cron.schedule('0 * * * * *', () => IO.update$chat$size()); // Every minute

cron.schedule('*/6 * * * * *', () => IO.update$queue()); // Every 6 seconds

