const express = require('express');
var app = require('express')();
var mysql = require('mysql');
var http = require('http').createServer(app)
var io = require('socket.io')(http, {
    allowEIO3: true,
})

const getuser = require('./api/user/GetUser')

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200);
        /让options请求快速返回/
    } else {
        next();
    }
});



var userlist = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Client.html')
})
app.use('/assets', express.static('assets'))

io.on('connection', (socket) => {
    socket.on('regisiter', (data) => {
        let item = {
            id: socket.id,
            name: data.data,
            type: data.type,
            status: 0,
            socketId: socket.id,
            src: 'http://localhost:3000/assets/x.jpg',
            content: ''
        }
        insertUse(item, e => {
            if (e == true) {
                io.emit('getUserlist', userlist);
                io.to(socket.id).emit('self', item);
            }
        })
    });

    socket.on('login', (data) => {
        let item = {
            id: data.data.id,
            type: data.data.type,
            status: 0,
            name: data.data.name,
            socketId: socket.id,
            src: 'http://localhost:3000/assets/x.jpg',
            content: ''
        }
        console.log(item, '登录信息')
        checkuser(res => {
            userlist = res
            res.forEach(element => {
                if (element.id == item.id) {
                    updateUse(item, null, e => {
                        if (e == true) {
                            io.to(item.socketId).emit('self', element);
                            io.emit('getUserlist', userlist);
                        }
                    })
                }
            });
        })
    });

    socket.on('ChatMessage', (data) => {
        insertHistory(data, data.receive.type, e => {
            if (e == true) {
                if (data.receive.type == 0) {
                    io.to(data.receive.socketId).emit('ReceiveMsg', { type: data.receive.type, receiveId: data.receive.id, sendId: data.send.id, name: data.receive.name, content: data.send.content, date: getdate() });
                } else {
                    io.to(data.receive.socketId).emit('ReceiveMsg', { type: data.receive.type, receiveId: data.receive.id, sendId: data.send.id, name: data.receive.name, content: data.send.content, date: getdate() });
                    io.to(data.send.socketId).emit('ReceiveMsg', { receiveId: data.receive.id, sendId: data.send.id, name: data.send.name, content: data.send.content, date: getdate() });
                }
                updateUse(data, true, e => {})
            }
        })
    });

    socket.on('joinRoom', (data) => {

        if (data.receive.type == 0) {
            socket.join(data.receive.socketId)
            getHistory(false, data.receive.id, e => {
                io.to(data.receive.socketId).emit('history', e);
                console.log(data.receive.socketId, data.send.socketId, e.length, '群聊')
            })
        } else if (data.receive.type == 1) {
            getHistory(data.send.id, data.receive.id, e => {
                io.to(data.receive.socketId).emit('history', e);
                io.to(data.send.socketId).emit('history', e);
                console.log(data.receive.socketId, data.send.socketId, e.length)
            })
        }

    });

    socket.on('disconnect', () => {});

});


function insertUse(data, callback) {

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });
    connection.connect();
    var sql;
    if (data.name.type == 0) {
        sql = "INSERT INTO user (id,name,type,status,socketId,src,content) VALUES('" + 'group_' + data.id + "','" + data.name.data + "','" + data.name.type + "',0,'" + data.socketId + "','" + data.src + "','" + data.content + "')";
    } else {
        sql = "INSERT INTO user (id,name,type,status,socketId,src,content) VALUES('" + data.id + "','" + data.name.data + "','" + data.name.type + "',0,'" + data.socketId + "','" + data.src + "','" + data.content + "')";
    }

    connection.query(sql, (err, result) => {
        if (err) {
            return;
        }
        callback(true)
    });
    connection.end();
}


function updateUse(data, e, callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });

    connection.connect();
    var sql;

    if (!e) {
        sql = "UPDATE user SET socketId='" + data.socketId + "' WHERE id ='" + data.id + "'";
    } else {
        sql = "UPDATE user SET content='" + data.send.content + "' WHERE id ='" + data.send.id + "'"
    }

    connection.query(sql, (err, result) => {
        if (err) {
            res.send("修改错误");
            return;
        }
        callback(true)
    })
    connection.end();
}

function checkuser(callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });

    connection.connect();
    let sql = "select * from user";
    connection.query(sql, (err, result) => {
        if (err) {
            return;
        }
        callback(result)
    })
    connection.end();
}

function insertHistory(data, type, callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });

    connection.connect();

    var sql;
    if (type == 0) {
        sql = "INSERT INTO history (uid,content,name,sendId,date) VALUES('" + data.receive.id + "','" + data.send.content + "','" + data.receive.name + "','" + data.send.id + "','" + getdate() + "')";
    } else if (type == 1) {
        sql = "INSERT INTO history (uid,content,name,sendId,date) VALUES('" + data.send.id + data.receive.id + "','" + data.send.content + "','" + data.receive.name + "','" + data.send.id + "','" + getdate() + "')";
    }
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            return;
        }
        callback(true)
    });

    connection.end();
}


function getHistory(send, receive, callback) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });

    let data1 = send + receive
    let data2 = receive + send
    connection.connect();
    let sql;
    if (!send) {
        sql = "select * from history WHERE  uid='" + receive + "'  order by id desc;"; //群聊
    } else {
        sql = "select * from history WHERE  uid='" + data1 + "' or uid='" + data2 + "' order by id desc;";
    }
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            return;
        }
        callback(result)
    })
    connection.end();
}

app.get('/user', function(req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        port: '3306',
        database: 'uniapp'
    });

    connection.connect();
    let sql = "select * from user";
    connection.query(sql, function(err, result) {
        if (err) {
            res.send("修改错误");
            return;
        }
        res.send(JSON.stringify(result));
    })
    connection.end();
});



function getdate() {
    var now = new Date(),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
}

http.listen(3000, () => {
    console.log('listen 3000 port')
})

app.listen(3001, () => {
    console.log('listen 3001 port')

})