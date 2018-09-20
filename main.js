enchant();

window.onload = function(){
    var core = new Core(960, 640);
	var genRand = new Array;
	var towerheigt = 180;
	var handY = 250;
	ft = 0;
	for (var i = 0; i<towerheigt; i++){
		var preRand = Math.floor(Math.random()*towerheigt+1);
		for (var j = 0; j<genRand.length; j++){
			if (preRand == genRand[j]){
				preRand = Math.floor(Math.random()*towerheigt+1);
				j = j-1;
			};
		};
		genRand[i] = preRand;
	};
	for (var i = 1; i<towerheigt; i++){
		precard = './cards/tower ('+i+').jpg';
		core.preload(precard);
	};
	core.preload('./aggro_button.png');
	core.preload('./surrender_button.png');
	core.preload('./back_image.jpg');
    core.fps = 20;
    core.onload = function(){
    	var scene = core.rootScene;
    	var cardx = 200;
    	var cardy = 0;
    	var label = new Label();
    	label.x = 300;
    	label.y = 5;
    	label.color =  'red';
    	label.font ='14px "Arial"';
    	label.text =genRand.length+","+ft;
    	var touchFunc = function(){
    		this.parentNode.removeChild(this);
    		this.image = core.assets['./cards/tower ('+genRand[fromtop()]+').jpg'];
    		this.scaleX = 0.6;
    		this.scaleY = 0.6;
    		this.moveTo(cardx, cardy);
    		this.ontouchstart = touchFunc;
    		scene.addChild(this);
    		label.text =genRand.length+","+ft;
    	};
    	for (var i = 0; i<1; ++i){
    		var card = new Sprite(201, 290);
    		card.image = core.assets['./cards/tower ('+genRand[fromtop()]+').jpg'];
    		card.scaleX = 0.6;
    		card.scaleY = 0.6;
    		card.moveTo(cardx + i*100, cardy);
    		card.ontouchstart = touchFunc;
    		scene.addChild(card);
    	};
    	var backImage = new Sprite(495,690);
    	backImage.image = core.assets['./back_image.jpg'];
    	backImage.scaleX = 0.25;
    	backImage.scaleY = 0.25;
    	backImage.moveTo(-100,-202);
    	label.text =genRand.length+","+ft;
 		backImage.addEventListener('touchstart', function(){
    		location.reload();
    	});
    	core.rootScene.addChild(backImage);
    	core.rootScene.addChild(label);
    };
	
    core.start();
	
};

function fromtop(){
	
	ft = ft+1;
	return ft
}
