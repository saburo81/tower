var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
id = 0;
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

app.get('/' , function(req, res){
   res.sendFile(__dirname + '/index.html');
});

var towerHeight = 159;
var topcardNum = 0;
var ft = 0; // from top
var tower = [];
var min = 1, max = towerHeight
function intRandom(min, max){
  return Math.floor( Math.random() * (max - min + 1)) + min;
};

io.on('connection',function(socket){
    id ++;
    console.log("userid"+id);
    socket.on('drawcard',function(){
      if (ft > tower.length){
      	console.log("tower over");
      } else {
          topcardNum = tower[ft];
          ft = ft+1;
          socket.emit('draw',topcardNum);
      };
      });
	socket.on('maketower',function(){
		console.log("make tower");
		ft = 0;
		var randoms =[];
		for(var i = min; i<= max; i++){
          while(true){
            var tmp = intRandom(min, max);
            if(!randoms.includes(tmp)){
              randoms.push(tmp);
              break;
            };
          };
        };
		tower = [];
		tower = randoms;
	});
	socket.on('play',function(msg){
		socket.broadcast.emit('opplay',msg);
	});
});
http.listen(PORT, function(){
  console.log('server listening. Port:' + PORT);
});