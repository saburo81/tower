var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
id = 0;
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
app.use(express.urlencoded({ extended: true }));

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
let cardImgDirents = fs.readdirSync(cardImgDirPath, { withFileTypes: true });
tower.all = cardImgDirents.filter(dirent => dirent.isFile()).map(({ name }) => name);
const banListPath = "./banList.json";
let banList = JSON.parse(fs.readFileSync(banListPath)).cards;
tower.current = tower.all.filter(card => !banList.includes(card));
tower.current = shuffle([...tower.current]);

// カード画像アップロード
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/cards');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage });

app.post('/api/cards', upload.array('files'), function (req, res, next) {
    cardImgDirents = fs.readdirSync(cardImgDirPath, { withFileTypes: true });
    tower.all = cardImgDirents.filter(dirent =>
        dirent.isFile()
    ).map(({ name }) => name);
    res.send('upload success');
});

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

    socket.on('banList', function (data) {
        switch (data.type) {
            case 'get':
                socket.emit('updateBanList', banList);
                break;
            case 'update':
                banList = data.banList;
                fs.writeFileSync(banListPath, JSON.stringify({ 'cards': banList }));
                tower.current = tower.current.filter(card => !banList.includes(card));
                socket.broadcast.emit('updateBanList', banList);
                break;
        }
    });
});

http.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});