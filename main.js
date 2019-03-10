enchant();
var socket = io();
var server = 'http://localhost:3000';
//�Q�[���Ɏg���ݒ�l
var SCREEN_WIDTH = 1280; //�X�N���[����
var SCREEN_HEIGHT = 800; //�X�N���[������
var GAME_FPS = 20000; //�Q�[����FPS, �����������񂾁c?
var TOWER_HEIGHT = 180; // �^���[�̖���
var card_image_width = 121; //��card image�̕�
var card_image_height = 174; //��card image�̍���
var card_scale = 1; //card image��scale�{�ɂ���, ���傤�ǂ����摜���~����
gameID = 0;
ft = 0 //�����^���[�̉����ڂ������Ă�
//socket = io.connect('http://localhost:3000'); // �T�[�o�ɐڑ�
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
	enterRobby() //�}�b�`���O����
      // �o�g���\�����݂��󂯎������
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
// �o�g���X�^�[�g
// �܂����r�[�𗣒E
socket.emit('leave robby', {id: socket.id});

//game.started = false;
//game.emittedStartSignal = false; �킩���

// �Q�[���X�^�[�g�ҋ@
//game.begin();
//game.ready(); �킩���

// �V�����Ahttp://localhost:3000/battle/:battleID �Ɛڑ�
battle = io.connect(server + '/battle/' + battleId);
// �o�g�����[���Ƃ̐ڑ����m�����ꂽ��
battle.on('connect', function() {
	console.log('battle connect');
waiting = true;
});

// �Q�[�����n�܂����ʒm���󂯎������
battle.on('game start', function() {
console.log('game start');
core.popScene();
});
tower(battleId, enemyName); //call tower function
}; //end function battlestart



function enterRobby(){
// �ڑ��ł����Ƃ������b�Z�[�W���󂯎������
	socket.emit('connect robby', gameID);
	socket.on('connected robby', function() {
	socket.emit('enter robby',{'nickname': prompt("enter your nickname (only Alphabet)")});
	waiting = true;
	matchingScene(); //�����炭�}�b�`���O�p�̉�ʂ��o���̂��H
	});
	
	// ���r�[�ɓ������Ƃ������b�Z�[�W���󂯎������
	socket.on('robby entered', function(id){
	socket.id = id;
	console.log(socket.id);
	});

	// ���̃��[�U���ڑ�������������
	socket.on('user disconected', function(data) {
	console.log('user disconnected:', data.id);
	});
	
	// ���r�[�̃��[�U�ꗗ���󂯎������
	socket.on('robby info', function(robbyInfo) {
	var robbyList = Object.keys(robbyInfo);
	console.log('robby info', robbyList[0]);
	for(var nn in robbyInfo){
		// �N�������疳�����Ńo�g���\������
		console.log(nn, socket.id);
		if(nn != socket.id){
			var enemyId = nn;
			var enemyNick = robbyInfo[nn];
			break;
		}
	}
	if(enemyId){
		// �o�g���\�����݂̃��b�Z�[�W�𑗐M
		socket.emit('battle proposal', {to: enemyId}, function(data){
		// �ԐM�������Ƃ��̃R�[���o�b�N
		waiting = false;
		var that = data;
		// �}�b�`���O�����̂Ƃ����V�[����\��
			matchedScene(function(){
				core.popScene();
				battleStart(socket.id, enemyId, that.battleId, enemyNick);
			});
		})
	}
	});
}; //end function enter robby

// �Q�[�����n�߂��ʒm�𑗂�
//sendStart = function(){
//battle.emit('game start', {});
//}


function matchingScene(){
	// �}�b�`���O���̉�ʂ�\��
	var matchingScene = new Scene();
	//matchingScene.image = core.assets['images/matching.jpg'];
	matchingScene.backgroundColor = '#fcc800';
	var title = new Label('Tower matching');                     // ���x�������
    title.textAlign = 'center';                             // �����𒆉���
    title.color = '#ffffff';                                // �����𔒐F��
    title.x = 0;                                            // ���ʒu����
    title.y = 96;                                           // �c�ʒu����
    title.font = '28px sans-serif';                         // 28px�̃S�V�b�N�̂ɂ���
    matchingScene.addChild(title);                                  // �V�[���ɒǉ�
    core.pushScene(matchingScene); //�}�b�`���O�V�[������ԏ�ɏd�˂�
} //end matching Scene

// �}�b�`���O�����̉�ʂ�\�����A2�b��Ɉ����̊֐����Ă�
function matchedScene(func){
	core.popScene();

	var matchingScene = new Scene();
	//matchingScene.image = core.assets['images/matching.jpg'];
	matchingScene.backgroundColor = '#fcc800';
	var title = new Label('Tower');                     // ���x�������
    title.textAlign = 'center';                             // �����𒆉���
    title.color = '#ffffff';                                // �����𔒐F��
    title.x = 0;                                            // ���ʒu����
    title.y = 96;                                           // �c�ʒu����
    title.font = '28px sans-serif';                         // 28px�̃S�V�b�N�̂ɂ���
    matchingScene.addChild(title);                           
	core.pushScene(matchingScene);
	setTimeout(func, 2000);
} // end matched Scene

function tower(battleId, enemyName){
	var towerDeck = new Array;
	var handList = []; //��D�̃J�[�h���X�g�A��ԍ���0��, �J�[�h���̂���
	var handListNum = []; //��D�̃J�[�h�i���o�[�̃��X�g
	var opntHandList = [];
	var opHandListNum = [];
	var cardx = 50;
    var cardy = 560;
	var op_cardx = 50
	var op_cardy = 50
	towerNum = new Label
	towerNum.textAlign = 'center';                             // �����𒆉���
    towerNum.color = '#ffffff';                                // �����𔒐F��
    towerNum.x = SCREEN_WIDTH*0.1;                                            // ���ʒu����
    towerNum.y = SCREEN_HEIGHT*0.35;                                         // �c�ʒu����
    towerNum.font = '28px sans-serif';                         // 28px�̃S�V�b�N�̂ɂ���

	console.log('call tower battleId', battleId);
	var label = new Label('Opponent = ' + enemyName);                     // ���x�������
    label.textAlign = 'center';                             // �����𒆉���
    label.color = '#ffffff';                                // �����𔒐F��
    label.x = 0;                                            // ���ʒu����
    label.y = 15;                                           // �c�ʒu����
    label.font = '28px sans-serif';                         // 28px�̃S�V�b�N�̂ɂ���
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

