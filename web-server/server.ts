import consoleStamp from "console-stamp";
import express from 'express';
import { Server } from 'socket.io';
import * as http from "http";
import * as path from "path";

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

const IO = new Server(HTTP);
      IO.on('connection', socket => {
        console.log('connection!')
      });
