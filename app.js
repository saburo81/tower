var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
id = 0;
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

app.set("view engine", "ejs");

app.get('/', function (req, res) {
    res.render('index', { "cardImages": tower.all });
});

const shuffle = (array) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// タワー構築
const fs = require("fs");
const tower = { all: [], current: [] };
const cardImgDirPath = "public/images/cards";
const cardImgDirents = fs.readdirSync(cardImgDirPath, { withFileTypes: true });
tower.all = cardImgDirents.filter(dirent => dirent.isFile()).map(({ name }) => name);
const banListPath = "./banList.json";
const banList = JSON.parse(fs.readFileSync(banListPath)).cards;
tower.current = tower.all.filter(card => !banList.includes(card));
tower.current = shuffle([...tower.current]);

io.on('connection', function (socket) {
    id++;
    console.log("userid" + id);
    socket.on('drawcard', function () {
        if (tower.current.length == 0) {
            console.log("tower over");
        } else {
            socket.emit('draw', tower.current.shift());
        };
    });
    socket.on('maketower', function () {
        console.log("make tower");
        tower.current = tower.all.filter(card => !banList.includes(card));
        tower.current = shuffle([...tower.current]);
    });
    socket.on('play', function (msg) {
        socket.broadcast.emit('opplay', msg);
    });

    socket.on('return', function (data) {
        tower.current.unshift(data);
    });
});

http.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});