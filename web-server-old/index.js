const express = require('express');
const app = express();

const http = require('http');
const server = http.Server(app);

const sockectIO = require('socket.io');
const io = sockectIO(server);

const port = process.env.PORT || 3000;

const connect = require('./db/dbConnect');
const MsgSchema = require('./models/msgSchema');

io.on('connection', (socket) => {
    // join a room specific for the event
    socket.on('join', (chat) => {
        console.log(chat)
        if(chat.user && chat.room) {
            socket.join(chat.room);
            io.sockets.adapter.clients([chat.room], function(err, clients){
                io.emit(chat.room + '-online-users', clients.length)
            })
        }
    });

    socket.on('message', (chat) => {
        if(chat.user && chat.room) {
            //update online users count
            let room = io.sockets.adapter.rooms[chat.room];
            if(room) io.emit(chat.room + '-online-users', room.length)

            //emit message to specific room
            io.emit(chat.room, chat);

            //save chat to the database
            connect.then(db  =>  {
                let  chatMessage  =  new MsgSchema(chat);
                chatMessage.save();
            });
        }
    })
})

// Find msgs endpoint
const msgRouter = require("./service/msgService");

/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

 */

app.use("/api", msgRouter);

/*
server.listen(port, () => {
    console.log(`started on port: ${port}`)
})

 */
