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
const doubleFaceCardListPath = "./doubleFaceCardList.json";
tower.current = tower.all.filter(card => !banList.includes(card));
tower.current = shuffle([...tower.current]);

// カード画像アップロード
const sharp = require('sharp');
const path = require('path');
const saveImage = async (req, res, next) => {
    // 画像保存
    const invalidFile = [];
    const basePath = {
        "frontFaceCardImages": 'public/images/cards/',
        "backFaceCardImages": 'public/images/cards/back-face/',
    }

    for (const face in req.files) {
        for (let i = 0; i < req.files[face].length; i++) {
            const file = req.files[face][i];

            // 拡張子確認
            const extension = path.extname(file.originalname).toLowerCase();
            if (!extension.match(/\.(jpg|jpeg|png|gif)$/)) {
                invalidFile.push({
                    'name': file.originalname,
                    'err': '対応していない拡張子'
                });
                continue;
            }

            // 中身が画像ファイルであることの確認
            await sharp(file.buffer)
                .toBuffer()
                .then(async () => {
                    // 画像リサイズ＆保存
                    await sharp(file.buffer)
                        .resize(221, 311, { fit: 'contain' })
                        .toFile(basePath[face] + file.originalname)
                        .catch(err => {
                            invalidFile.push({
                                'name': file.originalname,
                                'err': err
                            });
                        });
                })
                .catch(err => {
                    invalidFile.push({
                        'name': file.originalname,
                        'err': err
                    });
                });
        }
    };

    // 表裏面関連付けデータ保存
    let doubleFaceCardList = JSON.parse(fs.readFileSync(doubleFaceCardListPath)).cards;
    const reqBody = req.body['doubleFaceCardList'];
    const reqDoubleFaceCardList = [];
    if (Array.isArray(reqBody)) {
        for (let i = 0; i < reqBody.length; i++) {
            reqDoubleFaceCardList.push(JSON.parse(reqBody[i]));
        }
    } else {
        reqDoubleFaceCardList.push(JSON.parse(reqBody));
    }
    for (let i = 0; i < reqDoubleFaceCardList.length; i++) {
        existingRelation = doubleFaceCardList.find(
            card => card.front === reqDoubleFaceCardList[i].front
        );
        if (existingRelation) {
            if (reqDoubleFaceCardList[i].back) {
                existingRelation.back = reqDoubleFaceCardList[i].back;
            } else {
                doubleFaceCardList = doubleFaceCardList.filter((card) => {
                    return card.front != reqDoubleFaceCardList[i].front;
                }); 
            }
        } else {
            if (reqDoubleFaceCardList[i].back) {
                doubleFaceCardList.push(reqDoubleFaceCardList[i]);
            }
        }
    }
    fs.writeFileSync(doubleFaceCardListPath, JSON.stringify({ 'cards': doubleFaceCardList }));

    // カード画像読み込み
    cardImgDirents = fs.readdirSync(cardImgDirPath, { withFileTypes: true });
    tower.all = cardImgDirents.filter(dirent =>
        dirent.isFile()
    ).map(({ name }) => name);

    let resHTML = `完了: ${req.files['frontFaceCardImages'].length - invalidFile.length}件<br>`;
    if (invalidFile.length) {
        resHTML += `失敗: ${invalidFile.length}件<br>`
        for (let i = 0; i < invalidFile.length; i++) {
            const fileInfo = invalidFile[i];
            resHTML += `${fileInfo.name}: ${fileInfo.err}<br>`
        }
    }
    res.send(resHTML);
}

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post('/api/cards', upload.fields([
    { name: 'frontFaceCardImages' },
    { name: 'backFaceCardImages' },
    { name: 'doubleFaceCardList' }
]), saveImage);

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