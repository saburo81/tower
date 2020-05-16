enchant(); // enchantjs おまじない
var socket = io();
var SCREEN_WIDTH = 1680; //スクリーン幅
var SCREEN_HEIGHT = 960; //スクリーン高さ
var GAME_FPS = 30; //ゲームのFPS, いくつがいいんだ…?
var towerHeight = 200;


  
window.onload = function() {
    var core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
    var towerDeck = new Array;
	var handList = []; //手札のカードリスト、一番左が0番, カードそのもの
	var handListNum = []; //手札のカードナンバーのリスト
	var landList =[];
	var landListNum = [];
	var fieldList =[];
	var fieldListNum =[];
	var counterList =[];
	var counterLabelList =[];
	var upfieldList = [];
	var upfieldListNum = [];
	var card_image_width = 223;
	var card_image_height = 311;
	var card_scale = 0.6;
	var cardx = 100;
	var cardy = 710;
	var landx = 0;
	var landy = 205;
	var land_image_width = 431;
	var land_image_height = 599
	var land_scale = 0.25;
	var play_cardx = 100;
	var play_cardy = 170;
	var counter_x = 70;
	var counter_y = 30;
	var zoom_x = 1300;
	var zoom_y = 200;
	var zoom_scale = 1.2;
	var opcard_scale = 1.2;
	var back_scale = 0.7;
	var make_scale = 0.7;
	var reset_scale = 0.69;
	var token_scale = 0.6;
	var dice_scale = 0.4;
	var upfield_x = 150;
	var upfield_y = -55;
	var cards_path = 'images/cards/';
	var components_path = 'images/components/';
    scene = core.rootScene;
    scene.backgroundColor = "green";
    core.preload(components_path + 'back_image.jpg');
	core.preload(components_path + 'make_tower.jpg');
	core.preload(components_path + 'tower_land.jpg');
	core.preload(components_path + 'setland.jpg');
	core.preload(components_path + 'play.jpg');
	core.preload(components_path + 'discard.jpg');
	core.preload(components_path + 'cancel.jpg');
	core.preload(components_path + 'tap.jpg');
	core.preload(components_path + 'reset.jpg');
    core.preload(components_path + 'return_hand.jpg');
	core.preload(components_path + 'untap.jpg');
	core.preload(components_path + 'plus.jpg');
	core.preload(components_path + 'minus.jpg');
    core.preload(components_path + 'left.jpg');
	core.preload(components_path + 'right.jpg');
	core.preload(components_path + 'token.jpg');
	core.preload(components_path + 'maotoken.jpg');
	core.preload(components_path + 'return_tower.jpg');
	core.preload(components_path + 'zoom.jpg');
	core.preload(components_path + 'destroyland.jpg');
	core.preload(components_path + 'dice.gif');
	
	for (var i = 1; i<towerHeight; i++){
		precard = cards_path + 'tower ('+i+').jpg';
		core.preload(precard);
	};
    
    core.onload = function() {
    	var hand_space = new Sprite(SCREEN_WIDTH, 400);
    	var surface = new Surface(SCREEN_WIDTH,400);
    	surface.context.fillStyle = "beige";
    	surface.context.fillRect(0, 0, SCREEN_WIDTH, 400);
    	hand_space.image = surface;
    	hand_space.y = 585;
    	
    	var input = new Entity();
		//DOM設定
		input._element = document.createElement('input');
		input._element.setAttribute('type','text');
		input._element.setAttribute('maxlength','10');
		input._element.setAttribute('id','test');
		input._element.setAttribute('value','name');
    	//input._element.style.fontsize = '30px'
		input.width = 100;
		input.height = 50;
		input.x = 50;
		input.y = 10;
	    input.on(Event.ENTER_FRAME, function() {
		
		});
        var backImage = new Sprite(223,319);
        backImage.image = core.assets[components_path + 'back_image.jpg'];
        backImage.x = SCREEN_WIDTH/2-50;
        backImage.y = -70
    	backImage.scaleX = back_scale;
    	backImage.scaleY = back_scale;
    	backImage.rotation = 90;
        backImage.addEventListener('touchstart', function(){
            socket.emit('drawcard');
            
         });
    	var makeTower = new Sprite(210,99);
        makeTower.image = core.assets[components_path + 'make_tower.jpg'];
        makeTower.x = SCREEN_WIDTH-170;
        makeTower.y = 0;
    	makeTower.scaleX = make_scale;
    	makeTower.scaleY = make_scale;
    	makeTower.addEventListener('touchstart', function(){
            socket.emit('maketower');
            
         });
    	
    	var diceImage = new Sprite(175,175);
        diceImage.image = core.assets[components_path + 'dice.gif'];
        diceImage.x = -25;
        diceImage.y = 110;
    	diceImage.scaleX = dice_scale;
    	diceImage.scaleY = dice_scale;
    	var diceLabel = new Label('0');
    	diceLabel.color = "black";
	    diceLabel.font = "normal normal 30px/1.0 monospace";
    	diceLabel.x = 60;
    	diceLabel.y = 120;
    	scene.addChild(diceLabel);
    	diceImage.addEventListener('touchstart', function(){
    		core.rootScene.removeChild(diceLabel);
    		var diceNum = Math.floor( Math.random() * 6) + 1;
    		diceLabel.text = String(diceNum);
            //socket.emit('dice', diceNum);
    		scene.addChild(diceLabel);
         });
    	var resetImage = new Sprite(217,94);
        resetImage.image = core.assets[components_path + 'reset.jpg'];
        resetImage.x = SCREEN_WIDTH-172;
        resetImage.y = 80;
    	resetImage.scaleX = reset_scale;
    	resetImage.scaleY = reset_scale;
    	var reset_flag = false;
    	resetImage.addEventListener('touchstart', function(){
    		if (reset_flag){
            for (var i = 0; i<handList.length; ++i){
    		    var discard = handList[i];
      		    core.rootScene.removeChild(discard);
    		};
    		
    		for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
      		    core.rootScene.removeChild(discard);
    		};
    		
    		for (var i = 0; i<landList.length; ++i){
    		    var discard = landList[i];
      		    core.rootScene.removeChild(discard);
    		};
    		for (var i = 0; i<counterLabelList.length; ++i){
    		    var discard = counterLabelList[i];
      		    core.rootScene.removeChild(discard);
    		};
    		for (var i = 0; i<upfieldList.length; ++i){
    		    var discard = upfieldList[i];
      		    core.rootScene.removeChild(discard);
    		};
            handList = [];
    		handListNum = [];
    		fieldList = [];
    		fieldListNum = [];
    		landList = [];
    		counterList = [];
    		counterLabelList = [];
    		upfieldList = [];
    		upfieldListNum = [];
    		
    		reset_flag = false;
    		} else {
    			reset_flag = true;
    		};
         });
    	
    	var untapImage = new Sprite(108,74);
        untapImage.image = core.assets[components_path + 'untap.jpg'];
        untapImage.x = 10;
        untapImage.y = 250;
    	untapImage.addEventListener('touchstart', function(){
        for (var i = 0; i<fieldList.length; ++i){
    		 var discard = fieldList[i];
      		 discard.rotation = 0;
    		};
    		
    	for (var i = 0; i<landList.length; ++i){
    		 var discard = landList[i];
      		 discard.rotation = 0;
    		};
            
         
    	 for (var i = 0; i<upfieldList.length; ++i){
    		 var discard = upfieldList[i];
      		 discard.rotation = 0;
    		};
    	});
    	var destroyland = new Sprite(115,78);
        destroyland.image = core.assets[components_path + 'destroyland.jpg'];
        destroyland.x = 10;
        destroyland.y = 450;
    	destroyland.addEventListener('touchstart', function(){
          var target_land = landList[landList.length -1];
    	  core.rootScene.removeChild(target_land);
    	  landList.pop();
            
         });
    	
    	var tokenImage = new Sprite(218,93);
        tokenImage.image = core.assets[components_path + 'token.jpg'];
        tokenImage.x = -45;
        tokenImage.y = 310;
    	tokenImage.scaleX = token_scale-0.1;
    	tokenImage.scaleY = token_scale;
    	tokenImage.addEventListener('touchstart', function(){
        var play_card = new Sprite(card_image_width, card_image_height);
          	play_card.image = core.assets[components_path + 'maotoken.jpg'];
    	    play_card.scaleX = card_scale;
    	    play_card.scaleY = card_scale;
    	    play_card.moveTo(play_cardx + fieldList.length*Math.ceil(card_image_width*card_scale), play_cardy);
    	    play_card.ontouchstart = touchFuncPlayToken;
    	    core.rootScene.addChild(play_card);
    	    fieldList.push(play_card);
    		fieldListNum.push(10000);
    		var counter_label = new Label('0');
    		counterList.push(0);
    		counterLabelList.push(counter_label);
            
         });
    	socket.on('draw',function(data){
    	    var card = new Sprite(card_image_width, card_image_height);
    	    var card_name = cards_path + 'tower ('+data+').jpg';
          	card.image = core.assets[card_name];
    	    card.scaleX = card_scale;
    	    card.scaleY = card_scale;
    	    card.moveTo(cardx + handList.length*Math.ceil(card_image_width*card_scale), cardy);
    	    card.ontouchstart = touchFuncHand;
    	    scene.addChild(card);
    	    handList.push(card);
    		handListNum.push(data);
        });
    	
    	socket.on('opplay',function(data){
    		var opplay = new Sprite(card_image_width, card_image_height);
    		var opplay_name = cards_path + 'tower ('+data+').jpg';
    		var op_label = new Label('opponent play');
    		opplay.image = core.assets[opplay_name];
    	    opplay.scaleX = opcard_scale;
    	    opplay.scaleY = opcard_scale;
    	    opplay.x = 1200;
    		opplay.y = 50;
    		op_label.x = 1200;
    		op_label.y = opplay.y + 350;
    		op_label.color = "red";
	        op_label.font = "normal normal 30px/1.0 monospace";
    		opplay.addEventListener('touchstart', function(){
    	    this.parentNode.removeChild(this);
    		core.rootScene.removeChild(op_label);
    		});
    	    scene.addChild(opplay);
    		scene.addChild(op_label);
    	});
    	
    	var touchFuncHand = function(){
    	
    	
    		var setland = new Sprite(179,65);
    	    var discardImage = new Sprite(173,65);
    	    var playImage = new Sprite(162,63);
    		var cancelImage = new Sprite(181,69);
    		var reTower = new Sprite(180,71);
    		var zoomImage = new Sprite(184,74);
			setland.image = core.assets[components_path + 'setland.jpg'];
			discardImage.image = core.assets[components_path + 'discard.jpg'];
			playImage.image = core.assets[components_path + 'play.jpg'];
			cancelImage.image = core.assets[components_path + 'cancel.jpg'];
			reTower.image = core.assets[components_path + 'return_tower.jpg'];
			zoomImage.image = core.assets[components_path + 'zoom.jpg']
    		setland.x = this.x + 150;
            setland.y = this.y+105
    		zoomImage.x = this.x - 105;
            zoomImage.y = this.y+100;
    		zoomImage.scaleX = 0.95;
    		zoomImage.scaleY = 0.95;
    	    discardImage.x = this.x + 150;
            discardImage.y = this.y+40;
    		reTower.x = this.x - 105;
    		reTower.y = this.y + 35;
    		reTower.scaleX = 0.95;
    		reTower.scaleY = 0.95;
            playImage.x = this.x+30;
            playImage.y = this.y-20;
    		cancelImage.x = this.x+30;
    		cancelImage.y = this.y+170;
    		handcard_x = this.x
    		
    		var touchRemoveFuncHand = function(){
    		    core.rootScene.removeChild(setland);
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(playImage);
    			core.rootScene.removeChild(cancelImage);
    			core.rootScene.removeChild(reTower);
    			core.rootScene.removeChild(zoomImage);
    		};
    		playImage.addEventListener('touchstart', function(){
        
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    			};
    		};
    		var play_card_Num = handListNum[discard_num];
    		socket.emit('play',play_card_Num);
    		var play_card = new Sprite(card_image_width, card_image_height);
    		var play_card_name = cards_path + 'tower ('+play_card_Num+').jpg';
          	play_card.image = core.assets[play_card_name];
    	    play_card.scaleX = card_scale;
    	    play_card.scaleY = card_scale;
    	    play_card.moveTo(play_cardx + fieldList.length*Math.ceil(card_image_width*card_scale), play_cardy);
    	    play_card.ontouchstart = touchFuncPlay;
    	    core.rootScene.addChild(play_card);
    	    fieldList.push(play_card);
    		fieldListNum.push(play_card_Num);
    		var counter_label = new Label('0');
    		counterList.push(0);
    		counterLabelList.push(counter_label);
    		
    		var discard_set = handList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			handListNum[j-1] =handListNum[j]
    		};
    		handList.pop();
    		handListNum.pop();
    		touchRemoveFuncHand();	
            });
    		setland.addEventListener('touchstart', function(){
    			
    			var towerland = new Sprite(land_image_width,land_image_height);
    			towerland.image = core.assets[components_path + 'tower_land.jpg'];
    			towerland.scaleX = land_scale;
    			towerland.scaleY = land_scale;
    			towerland.moveTo(landx + landList.length*Math.ceil(land_image_width*land_scale), landy);
    	        towerland.ontouchstart = touchFuncLand;
    	        core.rootScene.addChild(towerland);
    	        landList.push(towerland);
    			
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = handList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			handListNum[j-1] =handListNum[j]
    			
    		};
    		handList.pop();
    		handListNum.pop();
    		touchRemoveFuncHand();	
            });
    		
    		discardImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = handList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			handListNum[j-1] =handListNum[j]
    		};
    		handList.pop();
    		handListNum.pop();
    		touchRemoveFuncHand();
            });
    		
    		cancelImage.addEventListener('touchstart', function(){
    		touchRemoveFuncHand();
            });
    		
    		reTower.addEventListener('touchstart', function(){
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = handList[discard_num];
    		var reTowerNum = handListNum[discard_num];
    		socket.emit('return',reTowerNum);
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			handListNum[j-1] =handListNum[j]
    		};
    		handList.pop();
    		handListNum.pop();
    		touchRemoveFuncHand();
            });
    		
    		zoomImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		var zoomNum = handListNum[discard_num];
    		var zoom_card = new Sprite(card_image_width, card_image_height);
    		var zoom_card_name = cards_path + 'tower ('+zoomNum+').jpg';
          	zoom_card.image = core.assets[zoom_card_name];
    	    zoom_card.scaleX = zoom_scale;
    	    zoom_card.scaleY = zoom_scale;
    	    zoom_card.x = this.x + 100;
    		zoom_card.y = this.y - 185;
    		zoom_card.addEventListener('touchstart', function(){
    			core.rootScene.removeChild(this);
    		});
    		core.rootScene.addChild(zoom_card);
    		touchRemoveFuncHand();
            });
    		
    		core.rootScene.addChild(setland);
    		core.rootScene.addChild(discardImage);
    		core.rootScene.addChild(playImage);
    		core.rootScene.addChild(cancelImage);
    		core.rootScene.addChild(reTower);
    		core.rootScene.addChild(zoomImage);
    	};
    	
    	// touch function field card
    	var touchFuncPlay = function(){
    	  var discardImage = new Sprite(173,65);
    	  var tapImage = new Sprite(177,71);
    	  var cancelImage = new Sprite(181,69);
    	  var reHand = new Sprite(180,70);
    	  var plusImage = new Sprite(63,57);
    	  var minusImage = new Sprite(59,58);
    	  var leftImage = new Sprite(61,59);
    	  var rightImage = new Sprite(60,60);
    	  var reTower = new Sprite(180,71);
    	  var zoomImage = new Sprite(184,74);
    	  var upImage = new Sprite(61,59);
    		
    	  discardImage.image = core.assets[components_path + 'discard.jpg'];
    	  tapImage.image = core.assets[components_path + 'tap.jpg'];
          cancelImage.image = core.assets[components_path + 'cancel.jpg'];
    	  reHand.image = core.assets[components_path + 'return_hand.jpg']
    	  plusImage.image = core.assets[components_path + 'plus.jpg'];
    	  minusImage.image = core.assets[components_path + 'minus.jpg'];
          leftImage.image = core.assets[components_path + 'left.jpg'];
    	  rightImage.image = core.assets[components_path + 'right.jpg']
    	  reTower.image = core.assets[components_path + 'return_tower.jpg'];
    	  zoomImage.image = core.assets[components_path + 'zoom.jpg'];
    	  upImage.image = core.assets[components_path + 'left.jpg'];

    	  discardImage.x = this.x + 170;
          discardImage.y = this.y+40;
    	  tapImage.x = this.x +30;
          tapImage.y = this.y - 30;
    	  cancelImage.x = this.x+30;
    	  cancelImage.y = this.y+170;
    	  reHand.x = this.x - 103;
    	  reHand.y = this.y + 102;
    	  reHand.scaleX = 0.90;
    	  reHand.scaleY = 0.95;
    	  plusImage.x = this.x + 65;
          plusImage.y = this.y + 240;
    	  minusImage.x = this.x + 130;
          minusImage.y = this.y + 240;
    	  leftImage.x = this.x ;
    	  leftImage.y = this.y + 240;
    	  rightImage.x = this.x + 195;
    	  rightImage.y = this.y + 240;
    	  zoomImage.x = this.x - 105;
          zoomImage.y = this.y + 35;
    	  zoomImage.scaleX = 0.9;
    	  zoomImage.scaleY = 0.9;
    	  reTower.x = this.x + 165;
    	  reTower.y = this.y + 100;
    	  reTower.scaleX = 0.95;
    	  reTower.scaleY = 0.95;
    	  upImage.x = this.x - 32;
    	  upImage.y = this.y - 30;
    	  upImage.rotate(90);
    	  ftargetx = this.x
    	  
    	  //remove button
    	  var touchRemoveFunc = function(){
    	  	core.rootScene.removeChild(discardImage);
    		core.rootScene.removeChild(tapImage);
    		core.rootScene.removeChild(cancelImage);
    	  	core.rootScene.removeChild(reHand);
          	core.rootScene.removeChild(plusImage);
    	  	core.rootScene.removeChild(minusImage);
    		core.rootScene.removeChild(leftImage);
    	  	core.rootScene.removeChild(rightImage);
    	  	core.rootScene.removeChild(zoomImage);
    	  	core.rootScene.removeChild(reTower);
    	  	core.rootScene.removeChild(upImage);
    		};
    		
    	  discardImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<fieldList.length; ++i){
    		        var discard = fieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = fieldList[discard_num];
    		core.rootScene.removeChild(discard_set);
    	  	var discard_label = counterLabelList[discard_num];
    	  	core.rootScene.removeChild(discard_label);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			var targetLabel = counterLabelList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			targetLabel.moveTo(move_card.x + counter_x, move_card.y + counter_y);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j];
    			counterList[j-1] = counterList[j];
    			counterLabelList[j-1] = counterLabelList[j];
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	counterLabelList.pop();
    	  	counterList.pop();
    	  	touchRemoveFunc();
    	  	
          });
    	  
    	  cancelImage.addEventListener('touchstart', function(){
    	  	touchRemoveFunc();
    	  });
    	  
    	  tapImage.addEventListener('touchstart', function(){
    	  	for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var tapcard = fieldList[discard_num];
    	  	if (tapcard.rotation == 90){
    	  		tapcard.rotate(-90);
    	  	} else {
    	  		tapcard.rotate(90);
    	  	};
            
    	  	touchRemoveFunc();
    	  
    	  });
    	  
    	  reHand.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var reHandNum = fieldListNum[discard_num];
    	  	
    	  	var card = new Sprite(card_image_width, card_image_height);
    	    var card_name = cards_path + 'tower ('+reHandNum+').jpg';
          	card.image = core.assets[card_name];
    	    card.scaleX = card_scale;
    	    card.scaleY = card_scale;
    	    card.moveTo(cardx + handList.length*Math.ceil(card_image_width*card_scale), cardy);
    	    card.ontouchstart = touchFuncHand;
    	    scene.addChild(card);
    	    handList.push(card);
    		handListNum.push(reHandNum);
    	  	
    	  	var discard_set = fieldList[discard_num];
    	  	core.rootScene.removeChild(discard_set);
    		var discard_label = counterLabelList[discard_num];
    	  	core.rootScene.removeChild(discard_label);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			var targetLabel = counterLabelList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			targetLabel.moveTo(move_card.x + counter_x, move_card.y + counter_y);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j];
    			counterList[j-1] = counterList[j];
    			counterLabelList[j-1] = counterLabelList[j];
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	counterLabelList.pop();
    	  	counterList.pop();
    	  	touchRemoveFunc();
          });
    	  
    	leftImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		if (discard_num != 0){
    		
    		var target = fieldList[discard_num];
    	  	var left = fieldList[discard_num -1];
    		var targetNum = fieldListNum[discard_num];
    		var leftNum = fieldListNum[discard_num-1];
    		var targetCounter = counterList[discard_num];
    		var targetLabel = counterLabelList[discard_num];
    		var leftCounter = counterList[discard_num-1];
    		var leftLabel = counterLabelList[discard_num-1];
    			
    		target.moveTo(target.x - Math.ceil(card_image_width*card_scale), play_cardy);
            left.moveTo(left.x + Math.ceil(card_image_width*card_scale), play_cardy);
    		targetLabel.moveTo(target.x + counter_x, target.y + counter_y);
    		leftLabel.moveTo(left.x + counter_x, target.y + counter_y);	
    		fieldList[discard_num] = left;
    		fieldList[discard_num -1] = target;
    		fieldListNum[discard_num] = leftNum;
    		fieldListNum[discard_num -1] = targetNum;
    		counterList[discard_num] = leftCounter;
    		counterList[discard_num-1] = targetCounter;
    		counterLabelList[discard_num] = leftLabel;
    		counterLabelList[discard_num-1] = targetLabel;
    			
    		};
    	  	
    		touchRemoveFunc();
          });
    	
    	rightImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		if (discard_num < fieldList.length-1){
    		
    		var target = fieldList[discard_num];
    	  	var right = fieldList[discard_num + 1];
    		var targetNum = fieldListNum[discard_num];
    		var rightNum = fieldListNum[discard_num+1];
    		var targetCounter = counterList[discard_num];
    		var targetLabel = counterLabelList[discard_num];
    		var rightCounter = counterList[discard_num+1];
    		var rightLabel = counterLabelList[discard_num+1];
    		target.moveTo(target.x + Math.ceil(card_image_width*card_scale), play_cardy);
            right.moveTo(right.x - Math.ceil(card_image_width*card_scale), play_cardy);
    		targetLabel.moveTo(target.x + counter_x, target.y + counter_y);
    		rightLabel.moveTo(right.x + counter_x, target.y + counter_y);
    		fieldList[discard_num] = right;
    		fieldList[discard_num + 1] = target;
    		fieldListNum[discard_num] = rightNum;
    		fieldListNum[discard_num + 1] = targetNum;
    		counterList[discard_num] = rightCounter;
    		counterList[discard_num+1] = targetCounter;
    		counterLabelList[discard_num] = rightLabel;
    		counterLabelList[discard_num+1] = targetLabel;
    		
    			
    		};
    	  	
    		touchRemoveFunc();
          });
    	upImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
     		var targetNum = fieldListNum[discard_num];

    		var up_card = new Sprite(card_image_width, card_image_height);
    		var up_card_name = cards_path + 'tower ('+targetNum+').jpg';
          	up_card.image = core.assets[up_card_name];
    	    up_card.scaleX = card_scale;
    	    up_card.scaleY = card_scale;
    	    up_card.moveTo(upfield_x + upfieldList.length*Math.ceil(card_image_width*card_scale), upfield_y);
    	    up_card.ontouchstart = touchFuncPlayUp;
    	    core.rootScene.addChild(up_card);
    	    upfieldList.push(up_card);
    		upfieldListNum.push(targetNum);
    		
    		var discard_set = fieldList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		var discard_label = counterLabelList[discard_num];
    	  	core.rootScene.removeChild(discard_label);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			var targetLabel = counterLabelList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			targetLabel.moveTo(move_card.x + counter_x, move_card.y + counter_y);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j];
    			counterList[j-1] = counterList[j];
    			counterLabelList[j-1] = counterLabelList[j];
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	counterLabelList.pop();
    	  	counterList.pop();
    	  	
    		touchRemoveFunc();
          });
    	
    	plusImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var target = fieldList[discard_num];
    		var counterNum = counterList[discard_num];
    		var plus_counter = counterLabelList[discard_num]; 
    		var plus_counterNum = counterList[discard_num] + 1;
    		plus_counter.x = target.x+counter_x;
    		plus_counter.y = target.y+counter_y;
    		//plus_counter.color = "#FC9";
	        plus_counter.font = "normal normal 30px/1.0 monospace";
    		if (plus_counterNum >= 0){
    		plus_counter.text = '+'+ String(plus_counterNum) + '/+'+ String(plus_counterNum);
    		} else {
    		plus_counter.text =  String(plus_counterNum) + '/'+ String(plus_counterNum);
    		};
    		core.rootScene.addChild(plus_counter);
    		if ( plus_counterNum == 0){
    			core.rootScene.removeChild(plus_counter);
    		};
    		counterList[discard_num] = counterList[discard_num] + 1;
    		counterLabelList[discard_num] = plus_counter;
    	  	
    		touchRemoveFunc();
        });
    	
    	minusImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var target = fieldList[discard_num];
    		var counterNum = counterList[discard_num];
    		var minus_counter = counterLabelList[discard_num]; 
    		var minus_counterNum = counterList[discard_num] - 1;
    		minus_counter.x = target.x+counter_x;
    		minus_counter.y = target.y+counter_y;
    		//minus_counter.color = "#FC9";
	        minus_counter.font = "normal normal 30px/1.0 monospace";
    		if (minus_counterNum >= 0){
    		minus_counter.text = '+'+ String(minus_counterNum) + '/+'+ String(minus_counterNum);
    		} else {
    		minus_counter.text =  String(minus_counterNum) + '/'+ String(minus_counterNum);
    		};
    		core.rootScene.addChild(minus_counter);
    		if ( minus_counterNum == 0){
    			core.rootScene.removeChild(minus_counter);
    		};
    		counterList[discard_num] = counterList[discard_num] - 1;
    		counterLabelList[discard_num] = minus_counter;
    	  	
    		touchRemoveFunc();
          });
    	    zoomImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<fieldList.length; ++i){
    		        var discard = fieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		var zoomNum = fieldListNum[discard_num];
    		var zoom_card = new Sprite(card_image_width, card_image_height);
    		var zoom_card_name = cards_path + 'tower ('+zoomNum+').jpg';
          	zoom_card.image = core.assets[zoom_card_name];
    	    zoom_card.scaleX = zoom_scale;
    	    zoom_card.scaleY = zoom_scale;
    	    zoom_card.x = zoom_x;
    		zoom_card.y = zoom_y
    		zoom_card.addEventListener('touchstart', function(){
    			core.rootScene.removeChild(this);
    		});
    		core.rootScene.addChild(zoom_card);
    		touchRemoveFunc();
            });
    		
    		reTower.addEventListener('touchstart', function(){
    			for (var i = 0; i<fieldList.length; ++i){
    		        var discard = fieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = fieldList[discard_num];
    		var reTowerNum = fieldListNum[discard_num];
    		socket.emit('return',reTowerNum);
    		core.rootScene.removeChild(discard_set);
    		var discard_label = counterLabelList[discard_num];
    	  	core.rootScene.removeChild(discard_label);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			var targetLabel = counterLabelList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			targetLabel.moveTo(move_card.x + counter_x, move_card.y + counter_y);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j];
    			counterList[j-1] = counterList[j];
    			counterLabelList[j-1] = counterLabelList[j];
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	counterLabelList.pop();
    	  	counterList.pop();
    		touchRemoveFunc();
            });
    	core.rootScene.addChild(discardImage);
    	core.rootScene.addChild(tapImage);
    	core.rootScene.addChild(cancelImage);
    	core.rootScene.addChild(reHand);
    	core.rootScene.addChild(plusImage);
    	core.rootScene.addChild(minusImage);
    	core.rootScene.addChild(leftImage);
    	core.rootScene.addChild(rightImage);
    	core.rootScene.addChild(zoomImage);
    	core.rootScene.addChild(reTower);	
    	core.rootScene.addChild(upImage);
    	};
    	var touchFuncPlayToken = function(){
    	  var discardImage = new Sprite(173,65);
    	  var tapImage = new Sprite(177,71);
    	  var cancelImage = new Sprite(181,69);
    	  var plusImage = new Sprite(63,57);
    	  var minusImage = new Sprite(59,58);
    	  var leftImage = new Sprite(61,59);
    	  var rightImage = new Sprite(60,60);
    	      	  
    	  discardImage.image = core.assets[components_path + 'discard.jpg'];
    	  tapImage.image = core.assets[components_path + 'tap.jpg'];
          cancelImage.image = core.assets[components_path + 'cancel.jpg'];
    	  plusImage.image = core.assets[components_path + 'plus.jpg'];
    	  minusImage.image = core.assets[components_path + 'minus.jpg'];
          leftImage.image = core.assets[components_path + 'left.jpg'];
    	  rightImage.image = core.assets[components_path + 'right.jpg'];
    	  

    	  discardImage.x = this.x + 170;
          discardImage.y = this.y+100;
    	  tapImage.x = this.x +30;
          tapImage.y = this.y ;
    	  cancelImage.x = this.x+30;
    	  cancelImage.y = this.y+170;
    	  plusImage.x = this.x + 65;
          plusImage.y = this.y + 240;
    	  minusImage.x = this.x + 130;
          minusImage.y = this.y + 240;
    	  leftImage.x = this.x ;
    	  leftImage.y = this.y + 240;
    	  rightImage.x = this.x + 195;
    	  rightImage.y = this.y + 240;
    	  
    	  ftargetx = this.x
    	  
    	  //remove button
    	  var touchRemoveFuncToken = function(){
    	  	core.rootScene.removeChild(discardImage);
    		core.rootScene.removeChild(tapImage);
    		core.rootScene.removeChild(cancelImage);
          	core.rootScene.removeChild(plusImage);
    	  	core.rootScene.removeChild(minusImage);
    		core.rootScene.removeChild(leftImage);
    	  	core.rootScene.removeChild(rightImage);
    		};
    		
    	  discardImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<fieldList.length; ++i){
    		        var discard = fieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = fieldList[discard_num];
    		core.rootScene.removeChild(discard_set);
    	  	var discard_label = counterLabelList[discard_num];
    	  	core.rootScene.removeChild(discard_label);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			var targetLabel = counterLabelList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			targetLabel.moveTo(move_card.x + counter_x, move_card.y + counter_y);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j];
    			counterList[j-1] = counterList[j];
    			counterLabelList[j-1] = counterLabelList[j];
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	counterLabelList.pop();
    	  	counterList.pop();
    	  	touchRemoveFuncToken();
    	  	
          });
    	  
    	  cancelImage.addEventListener('touchstart', function(){
    	  	touchRemoveFuncToken();
    	  });
    	  
    	  tapImage.addEventListener('touchstart', function(){
    	  	for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var tapcard = fieldList[discard_num];
    	  	if (tapcard.rotation == 90){
    	  		tapcard.rotate(-90);
    	  	} else {
    	  		tapcard.rotate(90);
    	  	};
            
    	  	touchRemoveFuncToken();
    	  
    	  });
    	  
    	  
    	leftImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		if (discard_num != 0){
    		
    		var target = fieldList[discard_num];
    	  	var left = fieldList[discard_num -1];
    		var targetNum = fieldListNum[discard_num];
    		var leftNum = fieldListNum[discard_num-1];
    		var targetCounter = counterList[discard_num];
    		var targetLabel = counterLabelList[discard_num];
    		var leftCounter = counterList[discard_num-1];
    		var leftLabel = counterLabelList[discard_num-1];
    			
    		target.moveTo(target.x - Math.ceil(card_image_width*card_scale), play_cardy);
            left.moveTo(left.x + Math.ceil(card_image_width*card_scale), play_cardy);
    		targetLabel.moveTo(target.x + counter_x, target.y + counter_y);
    		leftLabel.moveTo(left.x + counter_x, target.y + counter_y);	
    		fieldList[discard_num] = left;
    		fieldList[discard_num -1] = target;
    		fieldListNum[discard_num] = leftNum;
    		fieldListNum[discard_num -1] = targetNum;
    		counterList[discard_num] = leftCounter;
    		counterList[discard_num-1] = targetCounter;
    		counterLabelList[discard_num] = leftLabel;
    		counterLabelList[discard_num-1] = targetLabel;
    			
    		};
    	  	
    		touchRemoveFuncToken();
          });
    	
    	rightImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		if (discard_num < fieldList.length-1){
    		
    		var target = fieldList[discard_num];
    	  	var right = fieldList[discard_num + 1];
    		var targetNum = fieldListNum[discard_num];
    		var rightNum = fieldListNum[discard_num+1];
    		var targetCounter = counterList[discard_num];
    		var targetLabel = counterLabelList[discard_num];
    		var rightCounter = counterList[discard_num+1];
    		var rightLabel = counterLabelList[discard_num+1];
    		target.moveTo(target.x + Math.ceil(card_image_width*card_scale), play_cardy);
            right.moveTo(right.x - Math.ceil(card_image_width*card_scale), play_cardy);
    		targetLabel.moveTo(target.x + counter_x, target.y + counter_y);
    		rightLabel.moveTo(right.x + counter_x, target.y + counter_y);
    		fieldList[discard_num] = right;
    		fieldList[discard_num + 1] = target;
    		fieldListNum[discard_num] = rightNum;
    		fieldListNum[discard_num + 1] = targetNum;
    		counterList[discard_num] = rightCounter;
    		counterList[discard_num+1] = targetCounter;
    		counterLabelList[discard_num] = rightLabel;
    		counterLabelList[discard_num+1] = targetLabel;
    		
    			
    		};
    	  	
    		touchRemoveFuncToken();
          });
    		
    	plusImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var target = fieldList[discard_num];
    		var counterNum = counterList[discard_num];
    		var plus_counter = counterLabelList[discard_num]; 
    		var plus_counterNum = counterList[discard_num] + 1;
    		plus_counter.x = target.x+counter_x;
    		plus_counter.y = target.y+counter_y;
    		//plus_counter.color = "#FC9";
	        plus_counter.font = "normal normal 30px/1.0 monospace";
    		if (plus_counterNum >= 0){
    		plus_counter.text = '+'+ String(plus_counterNum) + '/+'+ String(plus_counterNum);
    		} else {
    		plus_counter.text =  String(plus_counterNum) + '/'+ String(plus_counterNum);
    		};
    		core.rootScene.addChild(plus_counter);
    		if ( plus_counterNum == 0){
    			core.rootScene.removeChild(plus_counter);
    		};
    		counterList[discard_num] = counterList[discard_num] + 1;
    		counterLabelList[discard_num] = plus_counter;
    	  	
    		touchRemoveFuncToken();
        });
    	
    	minusImage.addEventListener('touchstart', function(){
    	    for (var i = 0; i<fieldList.length; ++i){
    		    var discard = fieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var target = fieldList[discard_num];
    		var counterNum = counterList[discard_num];
    		var minus_counter = counterLabelList[discard_num]; 
    		var minus_counterNum = counterList[discard_num] - 1;
    		minus_counter.x = target.x+counter_x;
    		minus_counter.y = target.y+counter_y;
    		//minus_counter.color = "#FC9";
	        minus_counter.font = "normal normal 30px/1.0 monospace";
    		if (minus_counterNum >= 0){
    		minus_counter.text = '+'+ String(minus_counterNum) + '/+'+ String(minus_counterNum);
    		} else {
    		minus_counter.text =  String(minus_counterNum) + '/'+ String(minus_counterNum);
    		};
    		core.rootScene.addChild(minus_counter);
    		if ( minus_counterNum == 0){
    			core.rootScene.removeChild(minus_counter);
    		};
    		counterList[discard_num] = counterList[discard_num] - 1;
    		counterLabelList[discard_num] = minus_counter;
    	  	
    		touchRemoveFuncToken();
          });
    	core.rootScene.addChild(discardImage);
    	core.rootScene.addChild(tapImage);
    	core.rootScene.addChild(cancelImage);
    	core.rootScene.addChild(plusImage);
    	core.rootScene.addChild(minusImage);
    	core.rootScene.addChild(leftImage);
    	core.rootScene.addChild(rightImage);
    		
    	};
    	
    	var touchFuncPlayUp = function(){
    	  var discardImage = new Sprite(173,65);
    	  var tapImage = new Sprite(177,71);
    	  var cancelImage = new Sprite(181,69);
    	  var reHand = new Sprite(180,70);
    	  var reTower = new Sprite(180,71);
    	  var zoomImage = new Sprite(184,74);
    	     		
    	  discardImage.image = core.assets[components_path + 'discard.jpg'];
    	  tapImage.image = core.assets[components_path + 'tap.jpg'];
          cancelImage.image = core.assets[components_path + 'cancel.jpg'];
    	  reHand.image = core.assets[components_path + 'return_hand.jpg']
    	  reTower.image = core.assets[components_path + 'return_tower.jpg'];
    	  zoomImage.image = core.assets[components_path + 'zoom.jpg'];

    	  discardImage.x = this.x + 170;
          discardImage.y = this.y + 100;
    	  tapImage.x = this.x +30;
          tapImage.y = this.y +30;
    	  cancelImage.x = this.x+30;
    	  cancelImage.y = this.y+230;
    	  reHand.x = this.x - 103;
    	  reHand.y = this.y + 162;
    	  reHand.scaleX = 0.90;
    	  reHand.scaleY = 0.95;
    	  zoomImage.x = this.x - 105;
          zoomImage.y = this.y + 95;
    	  zoomImage.scaleX = 0.9;
    	  zoomImage.scaleY = 0.9;
    	  reTower.x = this.x + 165;
    	  reTower.y = this.y + 160;
    	  reTower.scaleX = 0.95;
    	  reTower.scaleY = 0.95;
    	  ftargetx = this.x
    	  
    	  //remove button
    	  var touchRemoveFuncUp = function(){
    	  	core.rootScene.removeChild(discardImage);
    		core.rootScene.removeChild(tapImage);
    		core.rootScene.removeChild(cancelImage);
    	  	core.rootScene.removeChild(reHand);
          	core.rootScene.removeChild(zoomImage);
    	  	core.rootScene.removeChild(reTower);
    		};
    		
    	  discardImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<upfieldList.length; ++i){
    		        var discard = upfieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = upfieldList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<upfieldList.length; ++j){
    			var move_card = upfieldList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), upfield_y);
    			upfieldList[j-1] = upfieldList[j];
    			upfieldListNum[j-1] = upfieldListNum[j];
    		};
    		upfieldList.pop();
    		upfieldListNum.pop();
    	  	touchRemoveFuncUp();
    	  	
          });
    	  
    	  cancelImage.addEventListener('touchstart', function(){
    	  	touchRemoveFuncUp();
    	  });
    	  
    	  tapImage.addEventListener('touchstart', function(){
    	  	for (var i = 0; i<upfieldList.length; ++i){
    		    var discard = upfieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var tapcard = upfieldList[discard_num];
    	  	if (tapcard.rotation == 90){
    	  		tapcard.rotate(-90);
    	  	} else {
    	  		tapcard.rotate(90);
    	  	};
            
    	  	touchRemoveFuncUp();
    	  
    	  });
    	  
    	  reHand.addEventListener('touchstart', function(){
    	    for (var i = 0; i<upfieldList.length; ++i){
    		    var discard = upfieldList[i];
    		    if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var reHandNum = upfieldListNum[discard_num];
    	  	
    	  	var card = new Sprite(card_image_width, card_image_height);
    	    var card_name = cards_path + 'tower ('+reHandNum+').jpg';
          	card.image = core.assets[card_name];
    	    card.scaleX = card_scale;
    	    card.scaleY = card_scale;
    	    card.moveTo(cardx + handList.length*Math.ceil(card_image_width*card_scale), cardy);
    	    card.ontouchstart = touchFuncHand;
    	    scene.addChild(card);
    	    handList.push(card);
    		handListNum.push(reHandNum);
    	  	
    	  	var discard_set = upfieldList[discard_num];
    	  	core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<upfieldList.length; ++j){
    			var move_card = upfieldList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), upfield_y);
    			upfieldList[j-1] = upfieldList[j];
    			upfieldListNum[j-1] = upfieldListNum[j];
    		};
    		upfieldList.pop();
    		upfieldListNum.pop();
    	  	touchRemoveFuncUp();
          });
    	  
    	    zoomImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<upfieldList.length; ++i){
    		        var discard = upfieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		
    		var zoomNum = upfieldListNum[discard_num];
    		var zoom_card = new Sprite(card_image_width, card_image_height);
    		var zoom_card_name = cards_path + 'tower ('+zoomNum+').jpg';
          	zoom_card.image = core.assets[zoom_card_name];
    	    zoom_card.scaleX = zoom_scale;
    	    zoom_card.scaleY = zoom_scale;
    	    zoom_card.x = zoom_x;
    		zoom_card.y = zoom_y
    		zoom_card.addEventListener('touchstart', function(){
    			core.rootScene.removeChild(this);
    		});
    		core.rootScene.addChild(zoom_card);
    		touchRemoveFuncUp();
            });
    		
    		reTower.addEventListener('touchstart', function(){
    			for (var i = 0; i<upfieldList.length; ++i){
    		        var discard = upfieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = upfieldList[discard_num];
    		var reTowerNum = upfieldListNum[discard_num];
    		socket.emit('return',reTowerNum);
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<upfieldList.length; ++j){
    			var move_card = upfieldList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), upfield_y);
    			upfieldList[j-1] = upfieldList[j];
    			upfieldListNum[j-1] = upfieldListNum[j];
    		};
    		upfieldList.pop();
    		upfieldListNum.pop();
    	  	touchRemoveFuncUp();
          });
    	core.rootScene.addChild(discardImage);
    	core.rootScene.addChild(tapImage);
    	core.rootScene.addChild(cancelImage);
    	core.rootScene.addChild(reHand);
    	core.rootScene.addChild(zoomImage);
    	core.rootScene.addChild(reTower);	
    	};
    	
    	var touchFuncLand = function(){
    		if (this.rotation == 90){
    	  		this.rotate(-90);
    	  	} else {
    	  		this.rotate(90);
    	  	};
    	};
    	core.rootScene.addChild(hand_space);
    	core.rootScene.addChild(input);
    	core.rootScene.addChild(diceImage);
        core.rootScene.addChild(backImage);
    	core.rootScene.addChild(makeTower);
    	core.rootScene.addChild(resetImage);
    	core.rootScene.addChild(untapImage);
    	core.rootScene.addChild(tokenImage);
    	core.rootScene.addChild(destroyland);
    	
       };
      core.start();
};