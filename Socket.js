var app = require('express')();
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var debug = require('debug')('http')

// fake app


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Client.html')
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        // io.emit('chat message', msg);
        io.to(socket.id).emit('hi', msg);
        console.log(msg, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

http.listen(3000, () => {
    console.log('listen 3000 port ')
})