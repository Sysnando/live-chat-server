const express = require('express');
const app = express();

const http = require('http');
const server = http.Server(app);

const sockectIO = require('socket.io');
const io = sockectIO(server);

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {

    // join a room specific for the event
    socket.on('join', (chat) => {        
        socket.join(chat.name);
        io.sockets.adapter.clients([chat.name], function(err, clients){
            io.emit(chat.name + '-online-users', clients.length)
        })
    });

    socket.on('message', (chat) => {
        //update online users count
        let room = io.sockets.adapter.rooms[chat.name];
        if(room) io.emit(chat.name + '-online-users', room.length)

        //emit message to specific room
        io.emit(chat.name, chat);
    })
})

server.listen(port, () => {
    console.log(`started on port: ${port}`)
})
