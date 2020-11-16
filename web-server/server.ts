import consoleStamp from "console-stamp";
import express from 'express';
import * as http from "http";
import * as cron from 'node-cron';
import * as path from "path";
import {ServerIO} from "./io/io-server";

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

const IO = ServerIO.INSTANCE(HTTP);

// Scheduler
cron.schedule('0 */2 * * * *', () => IO.balancer$update()); // Update load balancer every 2 minutes
cron.schedule('*/30 * * * * *', () => IO.broadcast$size()); // Broadcast each rooms' capacity every 30s
cron.schedule('0 * * * * *', () => IO.chat$persist());      // Persist chat to database every 1 minute
