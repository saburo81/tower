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
	var fieldList = []; //盤面のリスト
	var landList = []; //土地のリスト
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
    	scene.backgroundColor = "green";
    	
		// 手札のカード処理タブ作成
		var playCard = new Entity();	// 生成
    	var setland  = new Entity();
    	var cancel = new Entity();
		playCard.width = 100;		// 幅を設定
		playCard.height= 40;		// 高さを設定
		playCard.backgroundColor = "red";	// 背景色を設定
		setland.width = 100;		// 幅を設定
		setland.height= 40;		// 高さを設定
		setland.backgroundColor = "blue";	// 背景色を設定
    	cancel.width = 100;		// 幅を設定
		cancel.height= 40;		// 高さを設定
		cancel.backgroundColor = "gray";	// 背景色を設定
    	
    	//手札、盤面、土地のy値を設定
    	var cardx = 0;
    	var cardy = 550;
    	var fieldy = 150;
    	var landy = 400;

    	//デバッグ用のLabel
    	var label = new Label();
    	label.x = 300;
    	label.y = 5;
    	label.color =  'red';
    	label.font ='14px "Arial"';
    	label.text =genRand.length+","+ft;
    	
    	//タワーのカードイメージ設定
    	var backImage = new Sprite(124,172);
    	backImage.image = core.assets['./back_image.jpg'];
    	backImage.moveTo(0,0);
    	
    	//手札のカードをプレイする処理
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
    	
    	//手札のカードを土地にする処理
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
    	
    	//土地のマナ出し処理
    	var landRotFunc = function(){
    		if (this.rotation == 0){
    			this.rotation += 30;
    		} else {
    			this.rotation -= 30;
    		};
    	};
    	//選択キャンセルの処理
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
    		scene.addChild(playCard);		// シーンに追加
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
