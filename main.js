enchant();

//�Q�[���Ɏg���ݒ�l
var SCREEN_WIDTH = 1280; //�X�N���[����
var SCREEN_HEIGHT = 800; //�X�N���[������
var GAME_FPS = 20; //�Q�[����FPS, �����������񂾁c?
var TOWER_HEIGHT = 180; // �^���[�̖���
var card_image_width = 201; //��card image�̕�
var card_image_height = 290; //��card image�̍���
var card_scale = 0.6; //card image��scale�{�ɂ���, ���傤�ǂ����摜���~����


window.onload = function(){
    var core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
	var genRand = new Array;
	var handList = []; //��D�̃J�[�h���X�g�A��ԍ���0��
	var fieldList = []; //�Ֆʂ̃��X�g
	var landList = []; //�y�n�̃��X�g
	ft = 0; //���̃J�[�h���^���[�̉����ڂ��J�E���g���Ă���O���[�o���ϐ�
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
	for (var i = 1; i<TOWER_HEIGHT; i++){
		precard = './cards/tower ('+i+').jpg';
		core.preload(precard);
	};
	
	core.preload('./back_image.jpg');
    core.fps = GAME_FPS;
    core.onload = function(){
    	var scene = core.rootScene;
    	scene.backgroundColor = "green";
    	
		// ��D�̃J�[�h�����^�u�쐬
		var playCard = new Entity();	// ����
    	var setland  = new Entity();
    	var cancel = new Entity();
		playCard.width = 100;		// ����ݒ�
		playCard.height= 40;		// ������ݒ�
		playCard.backgroundColor = "red";	// �w�i�F��ݒ�
		setland.width = 100;		// ����ݒ�
		setland.height= 40;		// ������ݒ�
		setland.backgroundColor = "blue";	// �w�i�F��ݒ�
    	cancel.width = 100;		// ����ݒ�
		cancel.height= 40;		// ������ݒ�
		cancel.backgroundColor = "gray";	// �w�i�F��ݒ�
    	
    	//��D�A�ՖʁA�y�n��y�l��ݒ�
    	var cardx = 0;
    	var cardy = 550;
    	var fieldy = 150;
    	var landy = 400;

    	//�f�o�b�O�p��Label
    	var label = new Label();
    	label.x = 300;
    	label.y = 5;
    	label.color =  'red';
    	label.font ='14px "Arial"';
    	label.text =genRand.length+","+ft;
    	
    	//�^���[�̃J�[�h�C���[�W�ݒ�
    	var backImage = new Sprite(124,172);
    	backImage.image = core.assets['./back_image.jpg'];
    	backImage.moveTo(0,0);
    	
    	//��D�̃J�[�h���v���C���鏈��
    	var playFunc = function(){
    		var selectCardx = this.x - 100;
    		for (var i = 0; i<handList.length; ++i){
    			var discard = handList[i];
    			if (selectCardx == discard.x){
    				var discard_num = i;
    				var selectCard = handList[discard_num];
    			};
    		};
    		
    		selectCard.moveTo(cardx + fieldList.length*Math.ceil(card_image_width*card_scale),fieldy);
    		fieldList.push(selectCard);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			
    		};
    		handList.pop();
    		label.text =genRand.length+","+ft;
    		console.log(discard_num);
    		this.parentNode.removeChild(this);
    		setland.parentNode.removeChild(setland);
    		cancel.parentNode.removeChild(cancel);
    	};
    	
    	//��D�̃J�[�h��y�n�ɂ��鏈��
    	var setLandFunc = function(){
    		var selectCardx = this.x - 100;
    		for (var i = 0; i<handList.length; ++i){
    			var discard = handList[i];
    			if (selectCardx == discard.x){
    				var discard_num = i;
    				var selectCard = handList[discard_num];
    			};
    		};
    		selectCard.parentNode.removeChild(selectCard);
    		var land = new Sprite(124,172);
    		land.image = core.assets['./back_image.jpg'];
    		land.scaleX = 0.75;
    		land.scaleY = 0.75;
    		land.moveTo(cardx + landList.length*Math.ceil(card_image_width*card_scale),landy);
    		land.ontouchstart = landRotFunc;
    		scene.addChild(land);
    		landList.push(selectCard);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			
    		};
    		handList.pop();
    		label.text =genRand.length+","+ft;
    		console.log(discard_num);
    		this.parentNode.removeChild(this);
    		playCard.parentNode.removeChild(playCard);
    		cancel.parentNode.removeChild(cancel);
    	};
    	
    	//�y�n�̃}�i�o������
    	var landRotFunc = function(){
    		if (this.rotation == 0){
    			this.rotation += 30;
    		} else {
    			this.rotation -= 30;
    		};
    	};
    	//�I���L�����Z���̏���
    	var cancelFunc = function(){
    		this.parentNode.removeChild(this);
    		playCard.parentNode.removeChild(playCard);
    		setland.parentNode.removeChild(setland);
    	};
    	var touchFunc = function(){
    		playCard.x = this.x + 100;
    		playCard.y = this.y - 20;
    		setland.x = playCard.x;
    		setland.y = playCard.y + 40;
    		cancel.x = playCard.x
    		cancel.y = playCard.y + 80;
    		playCard.ontouchstart = playFunc;
    		setland.ontouchstart = setLandFunc;
    		cancel.ontouchstart = cancelFunc;
    		scene.addChild(playCard);		// �V�[���ɒǉ�
    		scene.addChild(setland);
    		scene.addChild(cancel);
    		//this.parentNode.removeChild(this);
    		
    	};
    	for (var i = 0; i<7; ++i){
    		var card = new Sprite(card_image_width, card_image_height);
    		card.image = core.assets['./cards/tower ('+genRand[fromtop()]+').jpg'];
    		card.scaleX = card_scale;
    		card.scaleY = card_scale;
    		card.moveTo(cardx + i*Math.ceil(card_image_width*card_scale), cardy);
    		card.ontouchstart = touchFunc;
    		scene.addChild(card);
    		handList.push(card);
    	};
 
    	label.text =genRand.length+","+ft;
 		backImage.addEventListener('touchstart', function(){
    		var card = new Sprite(card_image_width, card_image_height);
    		card.image = core.assets['./cards/tower ('+genRand[fromtop()]+').jpg'];
    		card.scaleX = card_scale;
    		card.scaleY = card_scale;
    		card.moveTo(cardx + handList.length*Math.ceil(card_image_width*card_scale), cardy);
    		card.ontouchstart = touchFunc;
    		scene.addChild(card);
    		handList.push(card);
    	});
    	core.rootScene.addChild(backImage);
    	core.rootScene.addChild(label);
    	scene.addEventListener("touchstart", function(e) {
	    // sprite.x = e.x;
	    // sprite.y = e.y;
	    // �^�b�`�����ʒu�Ɉړ�
	    //var x = e.x - (card.width/2);	// �X�v���C�g���̔����̒l���������ƂŒ����ɂ���
	    //var y = e.y - (card.height/2);	// �X�v���C�g�����̔����̒l���������ƂŒ����ɂ���
	    //card.moveTo(x, y);
	});
    };
	
    core.start();
	
};

function fromtop(){
	
	ft = ft+1;
	return ft
}
