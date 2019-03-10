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

//���r�[�ɋ��郆�[�U (id : nickname)
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
  // ���r�[�֓���Ƃ��E�߂��Ă����Ƃ��̃C�x���g���X�i���`
  socket.on('enter robby', function (data){
  //if(data.nickname){
  // ���r�[�̃��[�U���z��Ƀf�[�^��ǉ�
  console.log(data.nickname);
  console.log(socket.id);
  robby[socket.id] = data.nickname;
 
  // �N���C�A���g�Ƀ��r�[�ɐڑ��ł������ƂƁA�N���C�A���g��id��ʒm
  socket.emit('robby entered', socket.id);
 
  // �N���C�A���g�Ƀ��r�[�ɂ��郆�[�U��ʒm
  socket.emit('robby info', robby);
  
  socket.broadcast.emit('user joined', { id: socket.id, nickname: data.nickname });
//} end if data.nickname
}); // end socket.on enter robby

// �o�g���̐\�����݂��������Ƃ��̃C�x���g���X�i���`
socket.on('battle proposal', function(data, fn){
if(data.to){
// �V�����o�g���ɑ΂��ăo�g��ID������U��
battleIDcounter = battleIDcounter + 1
var battleId =  battleIDcounter;
	console.log('battle proposal ID = ', battleId);
// �\�����݂����������Ƃ�ʒm
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
// �o�g�����n�߂�
startBattle(battleId);

// ����U��ꂽ�o�g��ID���N���C�A���g�ɕԓ�
fn({battleId : battleId});
}
});

// ���r�[�ɂ��郆�[�U�̏������߂�ꂽ�Ƃ��̃C�x���g���X�i
socket.on('robby info', function (data) {
// ���r�[�̃��[�U���z���Ԃ�
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


// �ʐM�ΐ���n�߂�
function startBattle(battleId){
// /battle/:battleId �ɑ΂���ڑ���҂��󂯂�C�x���g���X�i
var battle = io.of('/battle/'+ battleId).on('connection', function(socket){
 
 
// �Q�[�����n�߂��|�̒ʒm��broadcast
socket.on('game start', function(){
console.log('started');
socket.broadcast.emit('game start',{});
});
}); //battle end
} //startBattle end




