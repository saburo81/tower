enchant();


window.onload = function(){
    var core = new Core(960, 640);
	var genRand = new Array;
	for (var i = 0; i<7; i++){
		var preRand = Math.floor(Math.random()*180+1);
		for (var j = 0; j<genRand.length; j++){
			if (preRand == genRand[j]){
				preRand = Math.floor(Math.random()*180+1);
				j = j-1;
			};
		};
		genRand[i] = preRand;
	};
	random_card = './cards/tower ('+genRand[0]+').jpg';
	random_card2 = './cards/tower ('+genRand[1]+').jpg';
	random_card3 = './cards/tower ('+genRand[2]+').jpg';
	random_card4 = './cards/tower ('+genRand[3]+').jpg';
	random_card5 = './cards/tower ('+genRand[4]+').jpg';
	random_card6 = './cards/tower ('+genRand[5]+').jpg';
	random_card7 = './cards/tower ('+genRand[6]+').jpg';
	for (var i = 1; i<180; i++){
		precard = './cards/tower ('+i+').jpg';
		core.preload(precard);
	};
	core.preload('./aggro_button.png');
	core.preload('./surrender_button.png');
	

	
	core.preload('./cards/tower (2).jpg');
    core.fps = 30;
    core.onload = function(){
        var card1 = new Sprite(200, 285);
    	var card2 = new Sprite(200, 285);
    	var card3 = new Sprite(200, 285);
    	var card4 = new Sprite(200, 285);
    	var card5 = new Sprite(200, 285);
    	var card6 = new Sprite(200, 285);
    	var card7 = new Sprite(200, 285);
    	var label = new Label();
    	var ag_btn = new Sprite(100,22);
    	var sr_btn = new Sprite(100,21);
    	ag_btn.image = core.assets['./aggro_button.png'];
    	ag_btn.x = 200;
    	ag_btn.y = 250;
    	ag_btn.scaleX = 1.5;
    	ag_btn.scaleY = 1.5;
    	sr_btn.image = core.assets['./surrender_button.png'];
    	sr_btn.x = 500;
    	sr_btn.y = 250;
    	sr_btn.scaleX = 1.5;
    	sr_btn.scaleY = 1.5;
        card1.image = core.assets[random_card]
    	card2.image = core.assets[random_card2]
    	card3.image = core.assets[random_card3]
    	card4.image = core.assets[random_card4]
    	card5.image = core.assets[random_card5]
    	card6.image = core.assets[random_card6]
    	card7.image = core.assets[random_card7]
        card1.x = 0;
        card1.y = 0;
    	card1.scaleX = 0.5;
    	card1.scaleY = 0.5;
    	card2.x = 100;
        card2.y = 0;
    	card2.scaleX = 0.5;
    	card2.scaleY = 0.5;
    	card3.x = 200;
        card3.y = 0;
    	card3.scaleX = 0.5;
    	card3.scaleY = 0.5;
    	card4.x = 300;
        card4.y = 0;
    	card4.scaleX = 0.5;
    	card4.scaleY = 0.5;
    	card5.x = 400;
        card5.y = 0;
    	card5.scaleX = 0.5;
    	card5.scaleY = 0.5;
    	card6.x = 500;
        card6.y = 0;
    	card6.scaleX = 0.5;
    	card6.scaleY = 0.5;
    	card7.x = 600;
        card7.y = 0;
    	card7.scaleX = 0.5;
    	card7.scaleY = 0.5;
    	
    	card1.addEventListener('enterframe', function(){
    		label.x = 300;
    		label.y = 5;
    		label.color =  'red';
    		label.font ='14px "Arial"';
    		label.text = genRand[0]+","+genRand[1]+","+genRand[2]+","+genRand[3]+","+genRand[4]+","+genRand[5]+","+genRand[6]+","+genRand.length;
    		});
    		ag_btn.addEventListener('touchstart', function(){
    			
    			for (var i = 0; i<7; i++){
    				var preRand = Math.floor(Math.random()*180+1);
					for (var j = 0; j<genRand.length; j++){
						if (preRand == genRand[j]){
							preRand = Math.floor(Math.random()*180+1);
							j = j-1;
						};
					};
					genRand[i] = preRand
				};
				random_card = './cards/tower ('+genRand[0]+').jpg';
				random_card2 = './cards/tower ('+genRand[1]+').jpg';
				random_card3 = './cards/tower ('+genRand[2]+').jpg';
				random_card4 = './cards/tower ('+genRand[3]+').jpg';
				random_card5 = './cards/tower ('+genRand[4]+').jpg';
				random_card6 = './cards/tower ('+genRand[5]+').jpg';
				random_card7 = './cards/tower ('+genRand[6]+').jpg';
    			card1.image = core.assets[random_card]
    			card2.image = core.assets[random_card2]
    			card3.image = core.assets[random_card3]
    			card4.image = core.assets[random_card4]
    			card5.image = core.assets[random_card5]
    			card6.image = core.assets[random_card6]
    			card7.image = core.assets[random_card7]
    		});
    	sr_btn.addEventListener('touchstart', function(){
    			
    			for (var i = 0; i<7; i++){
    				var preRand = Math.floor(Math.random()*180+1);
					for (var j = 0; j<genRand.length; j++){
						if (preRand == genRand[j]){
							preRand = Math.floor(Math.random()*180+1);
							j = j-1;
						};
					};
					genRand[i] = preRand
				};
				random_card = './cards/tower ('+genRand[0]+').jpg';
				random_card2 = './cards/tower ('+genRand[1]+').jpg';
				random_card3 = './cards/tower ('+genRand[2]+').jpg';
				random_card4 = './cards/tower ('+genRand[3]+').jpg';
				random_card5 = './cards/tower ('+genRand[4]+').jpg';
				random_card6 = './cards/tower ('+genRand[5]+').jpg';
				random_card7 = './cards/tower ('+genRand[6]+').jpg';
    			card1.image = core.assets[random_card]
    			card2.image = core.assets[random_card2]
    			card3.image = core.assets[random_card3]
    			card4.image = core.assets[random_card4]
    			card5.image = core.assets[random_card5]
    			card6.image = core.assets[random_card6]
    			card7.image = core.assets[random_card7]
    		});
    	core.rootScene.addChild(card1);
    	core.rootScene.addChild(card2);
    	core.rootScene.addChild(card3);
    	core.rootScene.addChild(card4);
    	core.rootScene.addChild(card5);
    	core.rootScene.addChild(card6);
    	core.rootScene.addChild(card7);
    	core.rootScene.addChild(ag_btn);
    	core.rootScene.addChild(sr_btn);
    	//core.rootScene.addChild(label);
    };
	
    core.start();
	
};


