enchant(); // enchantjs おまじない
var socket = io();
var SCREEN_WIDTH = 1680; //スクリーン幅
var SCREEN_HEIGHT = 960; //スクリーン高さ
var GAME_FPS = 20000; //ゲームのFPS, いくつがいいんだ…?
var towerHeight = 159;


  
window.onload = function() {
    var core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
    var towerDeck = new Array;
	var handList = []; //手札のカードリスト、一番左が0番, カードそのもの
	var handListNum = []; //手札のカードナンバーのリスト
	var landList =[];
	var landListNum = [];
	var fieldList =[];
	var fieldListNum =[];
	var card_image_width = 223;
	var card_image_height = 311;
	var card_scale = 0.7;
	var cardx = 100;
	var cardy = 700;
	var landx = 0;
	var landy = 300;
	var land_image_width = 431;
	var land_image_height = 599
	var land_scale = 0.35;
	var play_cardx = 100;
	var play_cardy = 200;
    scene = core.rootScene;
    scene.backgroundColor = "green";
    core.preload('back_image.jpg');
	core.preload('make_tower.jpg');
	core.preload('tower_land.jpg');
	core.preload('setland.jpg');
	core.preload('play.jpg');
	core.preload('discard.jpg');
	core.preload('cancel.jpg');
	core.preload('tap.jpg');
	core.preload('reset.jpg');

	for (var i = 1; i<towerHeight; i++){
		precard = './cards/tower ('+i+').jpg';
		core.preload(precard);
	};
    
    core.onload = function() {
        var backImage = new Sprite(223,319);
        backImage.image = core.assets['back_image.jpg'];
        backImage.x = SCREEN_WIDTH/2-50;
        backImage.y = -50
    	backImage.scaleX = 0.75;
    	backImage.scaleY = 0.75;
    	backImage.rotation = 90;
        backImage.addEventListener('touchstart', function(){
            socket.emit('drawcard');
            
         });
    	var makeTower = new Sprite(210,99);
        makeTower.image = core.assets['make_tower.jpg'];
        makeTower.x = 0;
        makeTower.y = 0;
    	makeTower.addEventListener('touchstart', function(){
            socket.emit('maketower');
            
         });
    	
    	var resetImage = new Sprite(217,94);
        resetImage.image = core.assets['reset.jpg'];
        resetImage.x = 0;
        resetImage.y = 100;
    	resetImage.addEventListener('touchstart', function(){
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
            handList = [];
    		handListNum = [];
    		fieldList = [];
    		fieldListNum = [];
    		landList = [];
    		
         });
    	socket.on('draw',function(data){
    	    var card = new Sprite(card_image_width, card_image_height);
    	    var card_name = './cards/tower ('+data+').jpg';
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
    		var opplay_name = './cards/tower ('+data+').jpg';
    		var op_label = new Label('opponent play');
    		opplay.image = core.assets[opplay_name];
    	    opplay.scaleX = card_scale;
    	    opplay.scaleY = card_scale;
    	    opplay.x = 1200;
    		opplay.y = 0;
    		op_label.x = 1200;
    		op_label.y = 275;
    		op_label.color = "#FC9";
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
    		setland.image = core.assets['setland.jpg'];
    		discardImage.image = core.assets['discard.jpg'];
    		playImage.image = core.assets['play.jpg'];
    		cancelImage.image = core.assets['cancel.jpg'];
    		setland.x = this.x - 100;
            setland.y = this.y+100
    	    discardImage.x = this.x + 150;
            discardImage.y = this.y+100;
            playImage.x = this.x+30;
            playImage.y = this.y-20;
    		cancelImage.x = this.x+30;
    		cancelImage.y = this.y+170;
    		handcard_x = this.x
    		
    		playImage.addEventListener('touchstart', function(){
        	console.log("play",handcard_x);
    			for (var i = 0; i<handList.length; ++i){
    		        var discard = handList[i];
    		    	if (handcard_x == discard.x){
    				var discard_num = i;
    		    		console.log("discaard_num",discard_num);
    			};
    		};
    		var play_card_Num = handListNum[discard_num];
    		socket.emit('play',play_card_Num);
    		var play_card = new Sprite(card_image_width, card_image_height);
    		var play_card_name = './cards/tower ('+play_card_Num+').jpg';
          	play_card.image = core.assets[play_card_name];
    	    play_card.scaleX = card_scale;
    	    play_card.scaleY = card_scale;
    	    play_card.moveTo(play_cardx + fieldList.length*Math.ceil(card_image_width*card_scale), play_cardy);
    	    play_card.ontouchstart = touchFuncPlay;
    	    core.rootScene.addChild(play_card);
    	    fieldList.push(play_card);
    		fieldListNum.push(play_card_Num);
    		
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
    			core.rootScene.removeChild(setland);
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(playImage);
    			core.rootScene.removeChild(cancelImage);
            });
    		setland.addEventListener('touchstart', function(){
    			var towerland = new Sprite(land_image_width,land_image_height);
    			towerland.image = core.assets['tower_land.jpg'];
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
    			core.rootScene.removeChild(setland);
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(playImage);
    			core.rootScene.removeChild(cancelImage);
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
    		
    		core.rootScene.removeChild(setland);
            core.rootScene.removeChild(discardImage);
    		core.rootScene.removeChild(playImage);
    		core.rootScene.removeChild(cancelImage);
            });
    		
    		cancelImage.addEventListener('touchstart', function(){
    			core.rootScene.removeChild(setland);
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(playImage);
    			core.rootScene.removeChild(cancelImage);
            });
    		
    		core.rootScene.addChild(setland);
    		core.rootScene.addChild(discardImage);
    		core.rootScene.addChild(playImage);
    		core.rootScene.addChild(cancelImage);
    		
    	};
    	var touchFuncPlay = function(){
    	  var discardImage = new Sprite(173,65);
    	  var tapImage = new Sprite(177,71);
    	  var cancelImage = new Sprite(181,69);
    	  discardImage.image = core.assets['discard.jpg'];
    	  tapImage.image = core.assets['tap.jpg'];
          cancelImage.image = core.assets['cancel.jpg'];
    	  discardImage.x = this.x + 150;
          discardImage.y = this.y+100;
    	  tapImage.x = this.x - 150;
          tapImage.y = this.y+100;
    	  cancelImage.x = this.x+30;
    	  cancelImage.y = this.y+170;
    	  ftargetx = this.x
    	  discardImage.addEventListener('touchstart', function(){
    			for (var i = 0; i<fieldList.length; ++i){
    		        var discard = fieldList[i];
    		    	if (ftargetx == discard.x){
    				var discard_num = i;
    			};
    		};
    		var discard_set = fieldList[discard_num];
    		core.rootScene.removeChild(discard_set);
    		for (var j = discard_num+1; j<fieldList.length; ++j){
    			var move_card = fieldList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), play_cardy);
    			fieldList[j-1] = fieldList[j];
    			fieldListNum[j-1] =fieldListNum[j]
    		};
    		fieldList.pop();
    		fieldListNum.pop();
    	  	
            core.rootScene.removeChild(discardImage);
    	  	core.rootScene.removeChild(cancelImage);
    		core.rootScene.removeChild(tapImage);
          });
    	  
    	  cancelImage.addEventListener('touchstart', function(){
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(tapImage);
    			core.rootScene.removeChild(cancelImage);
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
                core.rootScene.removeChild(discardImage);
    			core.rootScene.removeChild(tapImage);
    			core.rootScene.removeChild(cancelImage);
          });
    	core.rootScene.addChild(discardImage);
    	core.rootScene.addChild(tapImage);
    	core.rootScene.addChild(cancelImage);
    	  
    	};
    	var touchFuncLand = function(){
    		if (this.rotation == 90){
    	  		this.rotate(-90);
    	  	} else {
    	  		this.rotate(90);
    	  	};
    	};
        core.rootScene.addChild(backImage);
    	core.rootScene.addChild(makeTower);
    	core.rootScene.addChild(resetImage);
       };
      core.start();
};