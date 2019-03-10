var app = require('express')();
var http = require('http').Server(app);
serveStatic = require('serve-static');
var TOWER_HEIGHT = 180; // 
var io = require('socket.io')(http);
id = 0; // player ID global
var towerDecks = new Array();
var genRand = new Array();
//return index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//ロビーに居るユーザ (id : nickname)
var robby = {};
// battleID counter
battleIDcounter = 0;

app.use(serveStatic(__dirname));
app.get('/', function(req, res){
	res.send(__dirname + '/index.html');
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});
io.on('connection', function(socket){
  id++; // ID increment
  console.log('a user connected'+id);
  socket.emit('msg setID', id)
  socket.on('connect robby', function(msg){
    socket.emit('connected robby', msg);
  });
  socket.on('disconnect', function(){
    delete robby[socket.id];
    socket.emit('user left');
    });
  socket.on('leave robby', function (id) {
    delete robby[socket.id];
    socket.emit('user left');
  });
  // ロビーへ入るとき・戻ってきたときのイベントリスナを定義
  socket.on('enter robby', function (data){
  //if(data.nickname){
  // ロビーのユーザ情報配列にデータを追加
  console.log(data.nickname);
  console.log(socket.id);
  robby[socket.id] = data.nickname;
 
  // クライアントにロビーに接続できたことと、クライアントのidを通知
  socket.emit('robby entered', socket.id);
 
  // クライアントにロビーにいるユーザを通知
  socket.emit('robby info', robby);
  
  socket.broadcast.emit('user joined', { id: socket.id, nickname: data.nickname });
//} end if data.nickname
}); // end socket.on enter robby

// バトルの申し込みがあったときのイベントリスナを定義
socket.on('battle proposal', function(data, fn){
if(data.to){
// 新しいバトルに対してバトルIDを割り振る
battleIDcounter = battleIDcounter + 1
var battleId =  battleIDcounter;
	console.log('battle proposal ID = ', battleId);
// 申し込みがあったことを通知
socket.broadcast.emit('battle proposal', {from: socket.id, to: data.to, battleId: battleId, nickname : robby[socket.id]});
console.log(battleId);
// make tower for battleId
for (var i = 0; i<TOWER_HEIGHT; i++){
		var preRand = Math.floor(Math.random()*TOWER_HEIGHT+1);
		for (var j = 0; j<genRand.length; j++){
			if (preRand == genRand[j]){
				preRand = Math.floor(Math.random()*TOWER_HEIGHT+1);
				j = j-1;
			};
		};
		genRand[i] = preRand;
	};
	towerDecks[battleId] = genRand;
// バトルを始める
startBattle(battleId);

// 割り振られたバトルIDをクライアントに返答
fn({battleId : battleId});
}
});

// ロビーにいるユーザの情報を求められたときのイベントリスナ
socket.on('robby info', function (data) {
// ロビーのユーザ情報配列を返す
socket.emit('robby info', robby);
});
socket.on('make tower', function(data){
	console.log('make tower',towerDecks[data.battleId].length, data.socketId)
	var towerSend = towerDecks[data.battleId];
	//socket.to(data.socketId).emit('send tower', towerSend);
	socket.emit('send tower', {socketId: data.socketId, tower:towerSend});
});

socket.on('draw card', function(msg){
	socket.broadcast.emit('draw card', msg);
});
socket.on('discard',function(data){
	socket.broadcast.emit('discard',data);
});
});


// 通信対戦を始める
function startBattle(battleId){
// /battle/:battleId に対する接続を待ち受けるイベントリスナ
var battle = io.of('/battle/'+ battleId).on('connection', function(socket){
 
 
// ゲームを始めた旨の通知をbroadcast
socket.on('game start', function(){
console.log('started');
socket.broadcast.emit('game start',{});
});
}); //battle end
} //startBattle end




