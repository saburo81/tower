enchant();

//ゲームに使う設定値
var SCREEN_WIDTH = 1280; //スクリーン幅
var SCREEN_HEIGHT = 800; //スクリーン高さ
var GAME_FPS = 20; //ゲームのFPS, いくつがいいんだ…?
var TOWER_HEIGHT = 180; // タワーの枚数
var card_image_width = 201; //元card imageの幅
var card_image_height = 290; //元card imageの高さ
var card_scale = 0.6; //card imageをscale倍にする, ちょうどいい画像が欲しい


window.onload = function(){
    var core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
	var genRand = new Array;
	var handList = []; //手札のカードリスト、一番左が0番
	ft = 0; //今のカードがタワーの何枚目かカウントしているグローバル変数
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
    	var cardx = 200;
    	var cardy = 400;
    	var label = new Label();
    	label.x = 300;
    	label.y = 5;
    	label.color =  'red';
    	label.font ='14px "Arial"';
    	label.text =genRand.length+","+ft;
    	var touchFunc = function(){
    		for (var i = 0; i<handList.length; ++i){
    			var discard = handList[i];
    			if (this.x == discard.x){
    				var discard_num = i;
    			};
    		};
    		this.parentNode.removeChild(this);
    		for (var j = discard_num+1; j<handList.length; ++j){
    			var move_card = handList[j];
    			move_card.moveTo(move_card.x - Math.ceil(card_image_width*card_scale), cardy);
    			handList[j-1] = handList[j];
    			
    		};
    		handList.pop();
    		label.text =genRand.length+","+ft;
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
    	var backImage = new Sprite(495,690);
    	backImage.image = core.assets['./back_image.jpg'];
    	backImage.scaleX = 0.25;
    	backImage.scaleY = 0.25;
    	backImage.moveTo(-100,-202);
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
	    // タッチした位置に移動
	    //var x = e.x - (card.width/2);	// スプライト幅の半分の値を引くことで中央にする
	    //var y = e.y - (card.height/2);	// スプライト高さの半分の値を引くことで中央にする
	    //card.moveTo(x, y);
	});
    };
	
    core.start();
	
};

function fromtop(){
	
	ft = ft+1;
	return ft
}
