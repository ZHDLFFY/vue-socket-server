const express = require('express');
const mysql = require('mysql');
const connection = require('../../content');

function getuser(id, callback) {

    console.log(id)
    let sql = "select * from user";
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('[select ERROR] - ', err.message);
            res.send("修改错误");
            return;
        }
        callback(result)
    })
    connection.end();
}

module.exports = getuser