const express = require('express');
const mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'uniapp'
});

connection.connect();


module.exports = connection