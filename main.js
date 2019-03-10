enchant();
var socket = io();
var server = 'http://localhost:3000';
//ゲームに使う設定値
var SCREEN_WIDTH = 1280; //スクリーン幅
var SCREEN_HEIGHT = 800; //スクリーン高さ
var GAME_FPS = 20000; //ゲームのFPS, いくつがいいんだ…?
var TOWER_HEIGHT = 180; // タワーの枚数
var card_image_width = 121; //元card imageの幅
var card_image_height = 174; //元card imageの高さ
var card_scale = 1; //card imageをscale倍にする, ちょうどいい画像が欲しい
gameID = 0;
ft = 0 //今がタワーの何枚目か数えてる
//socket = io.connect('http://localhost:3000'); // サーバに接続
socket.on('msg setID', function (msg) { 
    console.log("GameID:"+msg); 
    gameID = msg; //game ID set
  });






window.onload = function(){
    core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
	scene = core.rootScene;
	scene.backgroundColor = "green";

	for (var i = 1; i<TOWER_HEIGHT; i++){
		precard = './cards/tower ('+i+').jpg';
		core.preload(precard);
	};
	
	core.preload('./back_image.jpg');

	core.onload = function(){
	enterRobby() //マッチング処理
      // バトル申し込みを受け取ったら
      socket.on('battle proposal', function(data) {
      	if(data.to == socket.id){
			matchedScene(function(){
			core.popScene();
			battleStart(socket.id, data.from, data.battleId, data.nickname); //datafrom = enemyID, data.battleID = battleID
			});
      		
		}
	  });
	
	}//end console onload
    core.start();
}



function battleStart(myId, enemyId, battleId, enemyName){
// バトルスタート
// まずロビーを離脱
socket.emit('leave robby', {id: socket.id});

//game.started = false;
//game.emittedStartSignal = false; わからん

// ゲームスタート待機
//game.begin();
//game.ready(); わからん

// 新しく、http://localhost:3000/battle/:battleID と接続
battle = io.connect(server + '/battle/' + battleId);
// バトルルームとの接続が確立されたら
battle.on('connect', function() {
	console.log('battle connect');
waiting = true;
});

// ゲームが始まった通知を受け取ったら
battle.on('game start', function() {
console.log('game start');
core.popScene();
});
tower(battleId, enemyName); //call tower function
}; //end function battlestart



function enterRobby(){
// 接続できたというメッセージを受け取ったら
	socket.emit('connect robby', gameID);
	socket.on('connected robby', function() {
	socket.emit('enter robby',{'nickname': prompt("enter your nickname (only Alphabet)")});
	waiting = true;
	matchingScene(); //おそらくマッチング用の画面を出すのか？
	});
	
	// ロビーに入ったというメッセージを受け取ったら
	socket.on('robby entered', function(id){
	socket.id = id;
	console.log(socket.id);
	});

	// 他のユーザが接続を解除したら
	socket.on('user disconected', function(data) {
	console.log('user disconnected:', data.id);
	});
	
	// ロビーのユーザ一覧を受け取ったら
	socket.on('robby info', function(robbyInfo) {
	var robbyList = Object.keys(robbyInfo);
	console.log('robby info', robbyList[0]);
	for(var nn in robbyInfo){
		// 誰かいたら無条件でバトル申し込み
		console.log(nn, socket.id);
		if(nn != socket.id){
			var enemyId = nn;
			var enemyNick = robbyInfo[nn];
			break;
		}
	}
	if(enemyId){
		// バトル申し込みのメッセージを送信
		socket.emit('battle proposal', {to: enemyId}, function(data){
		// 返信がきたときのコールバック
		waiting = false;
		var that = data;
		// マッチング完了のというシーンを表示
			matchedScene(function(){
				core.popScene();
				battleStart(socket.id, enemyId, that.battleId, enemyNick);
			});
		})
	}
	});
}; //end function enter robby

// ゲームが始めた通知を送る
//sendStart = function(){
//battle.emit('game start', {});
//}


function matchingScene(){
	// マッチング中の画面を表示
	var matchingScene = new Scene();
	//matchingScene.image = core.assets['images/matching.jpg'];
	matchingScene.backgroundColor = '#fcc800';
	var title = new Label('Tower matching');                     // ラベルを作る
    title.textAlign = 'center';                             // 文字を中央寄せ
    title.color = '#ffffff';                                // 文字を白色に
    title.x = 0;                                            // 横位置調整
    title.y = 96;                                           // 縦位置調整
    title.font = '28px sans-serif';                         // 28pxのゴシック体にする
    matchingScene.addChild(title);                                  // シーンに追加
    core.pushScene(matchingScene); //マッチングシーンを一番上に重ねる
} //end matching Scene

// マッチング成立の画面を表示し、2秒後に引数の関数を呼ぶ
function matchedScene(func){
	core.popScene();

	var matchingScene = new Scene();
	//matchingScene.image = core.assets['images/matching.jpg'];
	matchingScene.backgroundColor = '#fcc800';
	var title = new Label('Tower');                     // ラベルを作る
    title.textAlign = 'center';                             // 文字を中央寄せ
    title.color = '#ffffff';                                // 文字を白色に
    title.x = 0;                                            // 横位置調整
    title.y = 96;                                           // 縦位置調整
    title.font = '28px sans-serif';                         // 28pxのゴシック体にする
    matchingScene.addChild(title);                           
	core.pushScene(matchingScene);
	setTimeout(func, 2000);
} // end matched Scene

function tower(battleId, enemyName){
	var towerDeck = new Array;
	var handList = []; //手札のカードリスト、一番左が0番, カードそのもの
	var handListNum = []; //手札のカードナンバーのリスト
	var opntHandList = [];
	var opHandListNum = [];
	var cardx = 50;
    var cardy = 560;
	var op_cardx = 50
	var op_cardy = 50
	towerNum = new Label
	towerNum.textAlign = 'center';                             // 文字を中央寄せ
    towerNum.color = '#ffffff';                                // 文字を白色に
    towerNum.x = SCREEN_WIDTH*0.1;                                            // 横位置調整
    towerNum.y = SCREEN_HEIGHT*0.35;                                         // 縦位置調整
    towerNum.font = '28px sans-serif';                         // 28pxのゴシック体にする

	console.log('call tower battleId', battleId);
	var label = new Label('Opponent = ' + enemyName);                     // ラベルを作る
    label.textAlign = 'center';                             // 文字を中央寄せ
    label.color = '#ffffff';                                // 文字を白色に
    label.x = 0;                                            // 横位置調整
    label.y = 15;                                           // 縦位置調整
    label.font = '28px sans-serif';                         // 28pxのゴシック体にする
	scene.addChild(label);
		socket.on('draw card', function(msg){
			console.log('opponent draw card')
			if(msg == battleId){
				scene.removeChild(towerNum);
				var card = new Sprite(card_image_width, card_image_height);
    			card.image = core.assets['./cards/tower ('+towerDeck[fromtop()]+').jpg'];
    			card.scaleX = card_scale;
    			card.scaleY = card_scale;
    			card.moveTo(op_cardx + opntHandList.length*Math.ceil(card_image_width*card_scale), op_cardy);
    			//card.ontouchstart = touchFunc;
    			scene.addChild(card);
    			opntHandList.push(card);
		    };
		});
		socket.on('discard', function(data){
			if(data.battleId == battleId){
				var op_discard = opntHandList[data.num];
				op_discard.parentNode.removeChild(op_discard);
				for (var j = data.num+1; j<opntHandList.length; ++j){
    			  var op_move_card = opntHandList[j];
    			  op_move_card.moveTo(op_move_card.x - Math.ceil(card_image_width*card_scale), op_cardy);
    			  opntHandList[j-1] = opntHandList[j];
    			
    		    };
				console.log('bf discard', opntHandList.length);
    		    opntHandList.pop();
				console.log('af discard', opntHandList.length);
			};
		});
		socket.emit('make tower',{battleId: battleId, socketId: socket.id});
		socket.on('send tower', function(data){
			if(data.socketId == socket.id) {
			  towerDeck = data.tower;
			  console.log('send tower', battleId, towerDeck.length);
			};
			console.log('get tower', towerDeck[1], towerDeck.length);
		});
	var backImage = new Sprite(124,172);
    backImage.image = core.assets['./back_image.jpg'];
    backImage.moveTo(SCREEN_WIDTH*0.4,SCREEN_HEIGHT*0.35);
	backImage.addEventListener('touchstart', function(){
		scene.removeChild(towerNum);
    	var card = new Sprite(card_image_width, card_image_height);
    	card.image = core.assets['./cards/tower ('+towerDeck[fromtop()]+').jpg'];
 		socket.emit('draw card', battleId);
    	card.scaleX = card_scale;
    	card.scaleY = card_scale;
    	card.moveTo(cardx + handList.length*Math.ceil(card_image_width*card_scale), cardy);
    	card.ontouchstart = touchFunc;
    	scene.addChild(card);
    	handList.push(card);
    });
	scene.addChild(backImage);
	
	var touchFunc = function(){
		console.log('card touch');
    	for (var i = 0; i<handList.length; ++i){
    		var discard = handList[i];
    			if (this.x == discard.x){
    				var discard_num = i;
    			};
    		};
			socket.emit('discard', {num:discard_num, battleId:battleId});
    		this.parentNode.removeChild(this);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			
    		};
    		handList.pop();
    	};
}; //end function tower
function fromtop(){
	
	ft = ft+1;
	towerNum.text = TOWER_HEIGHT - ft
	scene.addChild(towerNum);
	return ft
}

