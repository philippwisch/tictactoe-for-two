const express = require('express');
const path = require('path');
const { Server } = require("socket.io");

const app = express()
const port = 12345

const win = [
    [1,2,3],
    [4,5,6],
    [7,8,9],

    [1,4,7],
    [2,5,8],
    [3,6,9],

    [1,5,9],
    [3,5,7]
]

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
