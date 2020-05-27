enchant(); // enchantjs おまじない
import {
    setCard, removeCard, swapCard, tapCard, untapCard, destroyLand, setCounter,
    setCounterNum, removeCounter, swapCounter, zoomCard
} from './modules/action.js';

var socket = io();
var SCREEN_WIDTH = 1680; //スクリーン幅
var SCREEN_HEIGHT = 960; //スクリーン高さ
var towerHeight = 200;

window.onload = function () {
    var core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
    const cardList = {
        hand: { sprite: [], number: [] },
        land: { sprite: [], number: [] },
        field: { sprite: [], number: [] },
        upField: { sprite: [], number: [] },
        counter: { sprite: [], number: [] }
    }
    var cards_path = 'images/cards/';
    const cardProperties = {
        hand: {
            image: { width: 223, height: 311, scale: 0.6 },
            field: { x: 100, y: 650 },
            zoom: { scale: 1.2, x: 1250, y: 620 }
        },
        land: {
            image: { width: 431, height: 599, scale: 0.25 },
            field: { x: 0, y: 205 }
        },
        play: {
            image: { width: 223, height: 311, scale: 0.6 },
            field: { x: 100, y: 175 },
            zoom: { scale: 1.2, x: 1200, y: 150 }
        },
        playUp: {
            image: { width: 223, height: 311, scale: 0.6 },
            field: { x: 200, y: -45 },
            zoom: { scale: 1.2, x: 1200, y: 150 }
        },
        opCard: {
            image: { width: 223, height: 311, scale: 0.6 },
            zoom: { scale: 1.2, x: 1250, y: 200 }
        },
        counter: { x: 70, y: 30 },
        imagePath: { card: 'images/cards/', component: 'images/components/' }
    }
    var scene = core.rootScene;
    scene.backgroundColor = "green";

    // コンポーネントのプロパティ (Sprite)
    const componentProp = {
        operation: {
            play: { imgName: 'play.jpg', offset: { x: 30, y: 30 }, scale: 1.0 },
            setLand: { imgName: 'setland.jpg', offset: { x: 167, y: 150 }, scale: 0.95 },
            discard: { imgName: 'discard.jpg', offset: { x: 170, y: 90 }, scale: 1.0 },
            tap: { imgName: 'tap.jpg', offset: { x: 30, y: 25 }, scale: 1.0 },
            cancel: { imgName: 'cancel.jpg', offset: { x: 30, y: 215 }, scale: 1.0 },
            plus: { imgName: 'plus.jpg', offset: { x: 65, y: 290 }, scale: 1.0 },
            minus: { imgName: 'minus.jpg', offset: { x: 130, y: 290 }, scale: 1.0 },
            left: { imgName: 'left.jpg', offset: { x: 0, y: 290 }, scale: 1.0 },
            right: { imgName: 'right.jpg', offset: { x: 195, y: 290 }, scale: 1.0 },
            reHand: { imgName: 'return_hand.jpg', offset: { x: 167, y: 150 }, scale: 0.95 },
            reTower: { imgName: 'return_tower.jpg', offset: { x: -105, y: 150 }, scale: 0.9 },
            zoom: { imgName: 'zoom.jpg', offset: { x: -104, y: 85 }, scale: 0.9 },
            up: { imgName: 'up.jpg', offset: { x: -32, y: 20 }, scale: 1.0 }
        },
        field: {
            cardBack: { imgName: 'back_image.jpg', x: SCREEN_WIDTH / 2 - 50, y: -70, scale: 0.7, rotation: 90 },
            makeTower: { imgName: 'make_tower.jpg', x: SCREEN_WIDTH - 170, y: 0, scale: 0.7, rotation: 0 },
            reset: { imgName: 'reset.jpg', x: SCREEN_WIDTH - 172, y: 80, scale: 0.69, rotation: 0 },
            untapAll: { imgName: 'untap.jpg', x: 10, y: 250, scale: 1.0, rotation: 0 },
            addToken: { imgName: 'token.jpg', x: -45, y: 310, scale: 0.6, rotation: 0 },
            destroyLand: { imgName: 'destroyland.jpg', x: 10, y: 450, scale: 1.0, rotation: 0 },
            dice: { imgName: 'dice.gif', x: -25, y: 110, scale: 0.4, rotation: 0 }
        },
        card: {
            land: { imgName: 'tower_land.jpg' },
            token: { imgName: 'maotoken.jpg' }
        }
    };

    // コンポーネント画像のロード
    for (const category of Object.values(componentProp)) {
        for (const prop of Object.values(category)) {
            core.preload(`${cardProperties.imagePath.component}${prop.imgName}`);
        }
    }

    // カード画像のロード
    for (var i = 1; i < towerHeight; i++) {
        var precard = cards_path + 'tower (' + i + ').jpg';
        core.preload(precard);
    };

    const createOperationSprite = (card, operation, operationProp) => {
        const operationSprite = {
            play: new Sprite(162, 63),
            setLand: new Sprite(179, 65),
            discard: new Sprite(173, 65),
            tap: new Sprite(177, 71),
            cancel: new Sprite(181, 69),
            plus: new Sprite(63, 57),
            minus: new Sprite(59, 58),
            left: new Sprite(61, 59),
            right: new Sprite(60, 60),
            reHand: new Sprite(180, 70),
            reTower: new Sprite(186, 72),
            zoom: new Sprite(184, 74),
            up: new Sprite(61, 59)
        };

        for (const op of operation) {
            const imagePath = `${cardProperties.imagePath.component}${operationProp[op].imgName}`;
            operationSprite[op].image = core.assets[imagePath];
            operationSprite[op].scale(operationProp[op].scale, operationProp[op].scale);
            operationSprite[op].moveTo(card.x + operationProp[op].offset.x, card.y + operationProp[op].offset.y);
        };

        return operationSprite;
    }

    core.onload = function () {
        var hand_space = new Sprite(SCREEN_WIDTH, 400);
        var surface = new Surface(SCREEN_WIDTH, 400);
        surface.context.fillStyle = "beige";
        surface.context.fillRect(0, 0, SCREEN_WIDTH, 400);
        hand_space.image = surface;
        hand_space.y = 585;

        // プレイ順
        var playOrder = new Entity();
        playOrder._element = document.createElement('button');
        playOrder._element.setAttribute('id', 'playOrder');
        playOrder._element.setAttribute('class', 'team-red');
        playOrder._element.innerText = 1;
        playOrder.width = 56;
        playOrder.height = 56;
        playOrder.x = 5;
        playOrder.y = 10;
        playOrder._element.onclick = function () {
            this.innerText = this.innerText++ % 4 + 1;
            if (this.innerText % 2 != 0) {
                this.setAttribute('class', 'team-red');
            } else {
                this.setAttribute('class', 'team-blue');
            };
        };

        // プレイヤー名
        var input = new Entity();
        input._element = document.createElement('input');
        input._element.setAttribute('type', 'text');
        input._element.setAttribute('maxlength', '10');
        input._element.setAttribute('id', 'test');
        input._element.setAttribute('value', 'name');
        input.width = 150;
        input.height = 50;
        input.x = 75;
        input.y = 10;
        input.on(Event.ENTER_FRAME, function () {

        });

        // 手札枚数
        var handCardNum = new Entity();
        handCardNum._element = document.createElement('p');
        handCardNum._element.setAttribute('class', 'hand-card-num');
        handCardNum.width = 125;
        handCardNum.height = 50;
        handCardNum.x = 1100;
        handCardNum.y = 10;
        setHandCardNum(handCardNum._element, cardList.hand.sprite.length);

        // ライフカウンター
        var lifeCounter = new Entity();
        lifeCounter._element = document.createElement('input');
        lifeCounter._element.setAttribute('type', 'number');
        lifeCounter._element.setAttribute('id', 'life-counter');
        lifeCounter._element.setAttribute('value', '0');
        lifeCounter.width = 100;
        lifeCounter.height = 50;
        lifeCounter.x = 1250;
        lifeCounter.y = 10;

        // 各種コンポーネントの生成 (Sprite)
        const fieldComponent = {
            cardBack: new Sprite(223, 319),
            makeTower: new Sprite(210, 99),
            reset: new Sprite(217, 94),
            untapAll: new Sprite(108, 74),
            addToken: new Sprite(218, 93),
            destroyLand: new Sprite(115, 78),
            dice: new Sprite(175, 175)
        }

        for (const [key, value] of Object.entries(componentProp.field)) {
            fieldComponent[key].image = core.assets[`${cardProperties.imagePath.component}${value.imgName}`];
            fieldComponent[key].moveTo(value.x, value.y);
            fieldComponent[key].scale(value.scale, value.scale);
            fieldComponent[key].rotate(value.rotation);
        }

        // タワー
        fieldComponent.cardBack.addEventListener('touchstart', function () {
            socket.emit('drawcard');
        });

        // タワー再構築
        fieldComponent.makeTower.addEventListener('touchstart', function () {
            socket.emit('maketower');
        });

        // 盤面リセット
        var reset_flag = false;
        fieldComponent.reset.addEventListener('touchstart', function () {
            if (reset_flag) {
                for (var i = 0; i < cardList.hand.sprite.length; ++i) {
                    var discard = cardList.hand.sprite[i];
                    core.rootScene.removeChild(discard);
                };

                for (var i = 0; i < cardList.field.sprite.length; ++i) {
                    var discard = cardList.field.sprite[i];
                    core.rootScene.removeChild(discard);
                };

                for (var i = 0; i < cardList.land.sprite.length; ++i) {
                    var discard = cardList.land.sprite[i];
                    core.rootScene.removeChild(discard);
                };
                for (var i = 0; i < cardList.counter.sprite.length; ++i) {
                    var discard = cardList.counter.sprite[i];
                    core.rootScene.removeChild(discard);
                };
                for (var i = 0; i < cardList.upField.sprite.length; ++i) {
                    var discard = cardList.upField.sprite[i];
                    core.rootScene.removeChild(discard);
                };
                cardList.hand.sprite.splice(0);
                cardList.hand.number.splice(0);
                cardList.field.sprite.splice(0);
                cardList.field.number.splice(0);
                cardList.land.sprite.splice(0);
                cardList.counter.sprite.splice(0);
                cardList.counter.number.splice(0);
                cardList.upField.sprite.splice(0);
                cardList.upField.number.splice(0);

                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);

                reset_flag = false;
            } else {
                reset_flag = true;
            };
        });

        // 全アンタップ
        fieldComponent.untapAll.addEventListener('touchstart', function () {
            const targetFields = [cardList.field.sprite, cardList.upField.sprite, cardList.land.sprite];
            for (let field of targetFields) {
                for (let card of field) {
                    untapCard(card);
                };
            }
        });

        // トークン生成
        fieldComponent.addToken.addEventListener('touchstart', function () {
            const fieldList = cardList.field;
            setCard(10000, fieldList, cardProperties.play, cardProperties.imagePath.component, core, touchFuncPlayToken);
            setCounter(cardList.counter, cardProperties.counter, fieldList.sprite[fieldList.sprite.length - 1], core);
        });

        fieldComponent.destroyLand.addEventListener('touchstart', () => {
            destroyLand(core, cardList.land.sprite);
        });

        // サイコロ
        const diceLabel = new Label('0');
        diceLabel.color = "black";
        diceLabel.font = "normal normal 30px/1.0 monospace";
        diceLabel.moveTo(60, 120);
        scene.addChild(diceLabel);

        fieldComponent.dice.addEventListener('touchstart', function () {
            core.rootScene.removeChild(diceLabel);
            var diceNum = Math.floor(Math.random() * 6) + 1;
            diceLabel.text = String(diceNum);
            scene.addChild(diceLabel);
        });

        socket.on('draw', function (data) {
            setCard(data, cardList.hand, cardProperties.hand, cardProperties.imagePath.card, core, touchFuncHand);
            setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
        });

        socket.on('opplay', function (data) {
            const opplayName = `${cards_path}tower (${data}).jpg`;
            const opLabel = new Label('opponent play');
            opLabel.x = cardProperties.opCard.zoom.x;
            opLabel.y = cardProperties.opCard.zoom.y + 350;
            opLabel.color = "red";
            opLabel.font = "normal normal 30px/1.0 monospace";
            zoomCard(core.assets[opplayName], cardProperties.opCard, core, opLabel);
        });

        var touchFuncHand = function () {
            const targetCard = this;
            const targetCardIdx = cardList.hand.sprite.findIndex((card) => card === targetCard);
            const targetCardNum = cardList.hand.number[targetCardIdx];
            const operation = ['setLand', 'discard', 'play', 'cancel', 'reTower', 'zoom'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            const touchRemoveFuncHand = function () {
                for (const op of operation) {
                    core.currentScene.removeChild(operationSprite[op]);
                }
            };

            operationSprite.play.addEventListener('touchstart', function () {
                const fieldList = cardList.field;
                setCard(targetCardNum, fieldList, cardProperties.play, cardProperties.imagePath.card, core, touchFuncPlay);
                setCounter(cardList.counter, cardProperties.counter, fieldList.sprite[fieldList.sprite.length - 1], core);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
                socket.emit('play', targetCardNum);
            });

            operationSprite.setLand.addEventListener('touchstart', function () {
                setCard(10001, cardList.land, cardProperties.land, cardProperties.imagePath.component, core, touchFuncLand);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
            });

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
            });

            operationSprite.cancel.addEventListener('touchstart', function () {
                touchRemoveFuncHand();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                socket.emit('return', targetCardNum);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.hand, core);
                touchRemoveFuncHand();
            });

            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
        };

        // touch function field card
        var touchFuncPlay = function () {
            const targetCard = this;
            const targetCardIdx = cardList.field.sprite.findIndex((card) => card === targetCard);
            const targetCardNum = cardList.field.number[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right',
                'up', 'reHand', 'reTower', 'zoom'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            //remove button
            const touchRemoveFunc = function () {
                for (const op of operation) {
                    core.currentScene.removeChild(operationSprite[op]);
                }
            };

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.play, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
            });

            operationSprite.cancel.addEventListener('touchstart', function () {
                touchRemoveFunc();
            });

            operationSprite.tap.addEventListener('touchstart', function () {
                if (targetCard.rotation == 90) {
                    untapCard(targetCard);
                } else {
                    tapCard(targetCard);
                };
                touchRemoveFunc();
            });

            operationSprite.reHand.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.play, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                setCard(targetCardNum, cardList.hand, cardProperties.hand, cardProperties.imagePath.card, core, touchFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
            });

            operationSprite.left.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx > 0) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx - 1], cardList.field);
                    swapCounter( counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx - 1], counterList );
                };
                touchRemoveFunc();
            });

            operationSprite.right.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx < cardList.field.sprite.length - 1) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx + 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx + 1], counterList);
                };
                touchRemoveFunc();
            });

            operationSprite.up.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.play, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                setCard(targetCardNum, cardList.upField, cardProperties.playUp, cardProperties.imagePath.card, core, touchFuncPlayUp);
            });

            operationSprite.plus.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                setCounterNum(counterList.sprite[targetCardIdx], counterList.number[targetCardIdx] + 1, counterList);
                touchRemoveFunc();
            });

            operationSprite.minus.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                setCounterNum(counterList.sprite[targetCardIdx], counterList.number[targetCardIdx] - 1, counterList);
                touchRemoveFunc();
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.play, core);
                touchRemoveFunc();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.play, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                socket.emit('return', targetCardNum);
            });

            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
        };

        var touchFuncPlayToken = function () {
            const targetCard = this;
            const targetCardIdx = cardList.field.sprite.findIndex((card) => card === targetCard);
            const operation = ['discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            //remove button
            var touchRemoveFuncToken = function () {
                for (const op of operation) {
                    core.currentScene.removeChild(operationSprite[op]);
                }
            };

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.play, core, touchRemoveFuncToken);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
            });

            operationSprite.cancel.addEventListener('touchstart', function () {
                touchRemoveFuncToken();
            });

            operationSprite.tap.addEventListener('touchstart', function () {
                if (targetCard.rotation == 90) {
                    untapCard(targetCard);
                } else {
                    tapCard(targetCard);
                };
                touchRemoveFuncToken();
            });

            operationSprite.left.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx > 0) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx - 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx - 1], counterList);
                };
                touchRemoveFuncToken();
            });

            operationSprite.right.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx < cardList.field.sprite.length - 1) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx + 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx + 1], counterList);
                };
                touchRemoveFuncToken();
            });

            operationSprite.plus.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                setCounterNum(counterList.sprite[targetCardIdx], counterList.number[targetCardIdx] + 1, counterList);
                touchRemoveFuncToken();
            });

            operationSprite.minus.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                setCounterNum(counterList.sprite[targetCardIdx], counterList.number[targetCardIdx] - 1, counterList);
                touchRemoveFuncToken();
            });

            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
        };

        var touchFuncPlayUp = function () {
            const targetCard = this;
            const targetCardIdx = cardList.upField.sprite.findIndex((card) => card === targetCard);
            const targetCardNum = cardList.upField.number[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'reHand', 'reTower', 'zoom'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            //remove button
            const touchRemoveFuncUp = function () {
                for (const op of operation) {
                    core.currentScene.removeChild(operationSprite[op]);
                }
            };

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.playUp, core, touchRemoveFuncUp);
            });

            operationSprite.cancel.addEventListener('touchstart', function () {
                touchRemoveFuncUp();
            });

            operationSprite.tap.addEventListener('touchstart', function () {
                if (targetCard.rotation == 90) {
                    untapCard(targetCard);
                } else {
                    tapCard(targetCard);
                };
                touchRemoveFuncUp();
            });

            operationSprite.reHand.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.playUp, core, touchRemoveFuncUp);
                setCard(targetCardNum, cardList.hand, cardProperties.hand, cardProperties.imagePath.card, core, touchFuncHand);
                setHandCardNum(handCardNum._element, cardList.hand.sprite.length);
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.playUp, core);
                touchRemoveFuncUp();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.playUp, core, touchRemoveFuncUp);
                socket.emit('return', targetCardNum);
            });

            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
        };

        var touchFuncLand = function () {
            if (this.rotation == 90) {
                untapCard(this);
            } else {
                tapCard(this);
            };
        };

        // 手札領域の描画
        core.rootScene.addChild(hand_space);

        // コンポーネント画像の描画 (Entity)
        core.rootScene.addChild(playOrder);
        core.rootScene.addChild(input);
        core.rootScene.addChild(handCardNum);
        core.rootScene.addChild(lifeCounter);

        // コンポーネント画像の描画 (Sprite)
        for (const cmpnt of Object.values(fieldComponent)) {
            core.rootScene.addChild(cmpnt);
        }
    };
    core.start();
};

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};
