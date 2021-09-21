var app = require('express')();
var http = require('http').createServer(app)
var io = require('socket.io')(http, {
    allowEIO3: true,
})


app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200);
        /让options请求快速返回/
    } else {
        next();
    }
});

// fake app
let list = ''
let flag = false

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Client.html')
})


io.on('connection', socket => {

    socket.on('join', (data) => {
        console.log('fasong ', io.sockets.adapter.rooms)

        // socket.join(data, () => {
        //     list = data
        //         // io.to(list[0]).emit('chat', socket.id); // 广播给房间里的每个人
        // })
        socket.join('data', (res) => {
            // list = data
            console.log(res, 'res')
        })
    })


    socket.on('chat message', (msg) => {
        // io.emit('chat message', msg);
        console.log('--', msg)
        io.to('data').emit('chat', msg);
        console.log('fasong ', io.sockets.adapter.rooms)


    });

});



function getdate() {
    var now = new Date(),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
}

http.listen(3000, () => {
    console.log('listen 3000 port ')
})