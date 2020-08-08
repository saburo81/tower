enchant(); // enchantjs おまじない
import {
    setCard, removeCard, swapCard, tapCard, untapCard, faceUpDown, destroyLand,
    setCounter, setCounterNum, removeCounter, swapCounter, zoomCard
} from './modules/action.js';

var socket = io();
var SCREEN_WIDTH = 1680; //スクリーン幅
var SCREEN_HEIGHT = 960; //スクリーン高さ

window.onload = function () {
    const core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
    core.rootScene.backgroundColor = "green";

    const playHistory = [];

    const cardList = {
        hand: { sprite: [], name: [], isFaceDown: [] },
        land: { sprite: [], name: [] },
        field: { sprite: [], name: [], isFaceDown: [] },
        upField: { sprite: [], name: [], isFaceDown: [] },
        counter: { sprite: [], number: [] }  // spriteに格納されるのはLabelオブジェクト
    }

    // 表示中のoperationSprite
    let displayedOpSprite = null;

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
        field: {
            image: { width: 223, height: 311, scale: 0.6 },
            field: { x: 100, y: 175 },
            zoom: { scale: 1.2, x: 1200, y: 150 }
        },
        upField: {
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

    // コンポーネントのプロパティ
    const componentProp = {
        operation: {
            play: { imgName: 'play.jpg', width: 162, height: 63, offset: { x: 30, y: 30 }, scale: 1.0 },
            faceUpDown: { imgName: 'face_up_down.jpg', width: 60, height: 60, offset: { x: 210, y: 30 }, scale: 1.0 },
            setLand: { imgName: 'setland.jpg', width: 179, height: 65, offset: { x: 167, y: 150 }, scale: 0.95 },
            discard: { imgName: 'discard.jpg', width: 173, height: 65, offset: { x: 170, y: 90 }, scale: 1.0 },
            tap: { imgName: 'tap.jpg', width: 177, height: 71, offset: { x: 30, y: 25 }, scale: 1.0 },
            cancel: { imgName: 'cancel.jpg', width: 181, height: 69, offset: { x: 30, y: 215 }, scale: 1.0 },
            plus: { imgName: 'plus.jpg', width: 63, height: 57, offset: { x: 65, y: 290 }, scale: 1.0 },
            minus: { imgName: 'minus.jpg', width: 59, height: 58, offset: { x: 130, y: 290 }, scale: 1.0 },
            left: { imgName: 'left.jpg', width: 61, height: 59, offset: { x: 0, y: 290 }, scale: 1.0 },
            right: { imgName: 'right.jpg', width: 60, height: 60, offset: { x: 195, y: 290 }, scale: 1.0 },
            reHand: { imgName: 'return_hand.jpg', width: 180, height: 70, offset: { x: 167, y: 150 }, scale: 0.95 },
            reTower: { imgName: 'return_tower.jpg', width: 186, height: 72, offset: { x: -105, y: 150 }, scale: 0.9 },
            zoom: { imgName: 'zoom.jpg', width: 184, height: 74, offset: { x: -104, y: 85 }, scale: 0.9 },
            up: { imgName: 'up.jpg', width: 61, height: 59, offset: { x: -32, y: 20 }, scale: 1.0 }
        },
        field: {
            cardBack: { imgName: 'back_image.jpg', x: SCREEN_WIDTH / 2 - 50, y: -70, scale: 0.7, rotation: 90 },
            makeTower: { imgName: 'make_tower.jpg', x: SCREEN_WIDTH - 170, y: 0, scale: 0.7, rotation: 0 },
            reset: { imgName: 'reset.jpg', x: SCREEN_WIDTH - 172, y: 80, scale: 0.69, rotation: 0 },
            untapAll: { imgName: 'untap.jpg', x: 10, y: 300, scale: 1.0, rotation: 0 },
            addToken: { imgName: 'token.jpg', x: -45, y: 360, scale: 0.6, rotation: 0 },
            destroyLand: { imgName: 'destroyland.jpg', x: 10, y: 450, scale: 1.0, rotation: 0 }
        },
        card: {
            land: { imgName: 'tower_land.jpg' },
            token: { imgName: 'maotoken.jpg' }
        }, 
        dom: {
            playOrder: { width: 56, height: 56, x: 5, y: 10 },
            playerName: { width: 150, height: 50, x: 75, y: 10 },
            handCardNum: { width: 125, height: 50, x: 1100, y: 10 },
            lifeCounter: { width: 100, height: 50, x: 1250, y: 10 },
            undo: { width: 110, height: 50, x: 10, y: 245 },
            dice: { width: 76, height: 76, x: 25, y: 150 }
        }
    };

    // コンポーネント画像のロード
    for (const category of Object.values(componentProp)) {
        for (const prop of Object.values(category)) {
            if (prop.hasOwnProperty('imgName')) {
                core.preload(`${cardProperties.imagePath.component}${prop.imgName}`);
            }
        }
    }

    // カード画像のロード
    for (let i = 0; i < cardImages.length; i++) {
        const precard = `${cardProperties.imagePath.card}${cardImages[i]}`;
        core.preload(precard);
    };

    const createOperationSprite = (card, operation, operationProp) => {
        const operationSprite = {};

        for (const op of operation) {
            operationSprite[op] = new Sprite(
                componentProp.operation[op].width,
                componentProp.operation[op].height
            );
            const imagePath = `${cardProperties.imagePath.component}${operationProp[op].imgName}`;
            operationSprite[op].image = core.assets[imagePath];
            operationSprite[op].scale(operationProp[op].scale, operationProp[op].scale);
            operationSprite[op].moveTo(card.x + operationProp[op].offset.x, card.y + operationProp[op].offset.y);
        };

        return operationSprite;
    }

    // 表示中のoperationSpriteを削除する
    const touchRemoveFunc = function () {
        if (displayedOpSprite) {
            for (const sprite of Object.values(displayedOpSprite)) {
                core.rootScene.removeChild(sprite);
            }
            displayedOpSprite = null;
        }
    };

    core.onload = function () {
        var hand_space = new Sprite(SCREEN_WIDTH, 400);
        var surface = new Surface(SCREEN_WIDTH, 400);
        surface.context.fillStyle = "beige";
        surface.context.fillRect(0, 0, SCREEN_WIDTH, 400);
        hand_space.image = surface;
        hand_space.y = 585;

        // DOMコンポーネントの生成 (Entity)
        const domComponent = {
            playOrder: new Entity(),
            playerName: new Entity(),
            handCardNum: new Entity(),
            lifeCounter: new Entity(),
            undo: new Entity(),
            dice: new Entity()
        }

        for (const [key, entity] of Object.entries(domComponent)) {
            const prop = componentProp.dom[key];
            entity.width = prop.width;
            entity.height = prop.height;
            entity.moveTo(prop.x, prop.y);
        }

        // プレイ順
        const playOrderElement = document.createElement('button');
        playOrderElement.setAttribute('id', 'playOrder');
        playOrderElement.setAttribute('class', 'team-red');
        playOrderElement.innerText = 1;
        playOrderElement.onclick = function () {
            this.innerText = this.innerText++ % 4 + 1;
            if (this.innerText % 2 != 0) {
                this.setAttribute('class', 'team-red');
            } else {
                this.setAttribute('class', 'team-blue');
            };
        };
        domComponent.playOrder._element = playOrderElement;

        // プレイヤー名
        const playerNameElement = document.createElement('input');
        playerNameElement.setAttribute('type', 'text');
        playerNameElement.setAttribute('maxlength', '10');
        playerNameElement.setAttribute('id', 'test');
        playerNameElement.setAttribute('value', 'name');
        domComponent.playerName._element = playerNameElement;

        // 手札枚数
        const handCardNumElement = document.createElement('p');
        handCardNumElement.setAttribute('class', 'hand-card-num');
        domComponent.handCardNum._element = handCardNumElement;
        setHandCardNum(handCardNumElement, cardList.hand.sprite.length);

        // ライフカウンター
        const lifeCounterElement = document.createElement('input');
        lifeCounterElement.setAttribute('type', 'number');
        lifeCounterElement.setAttribute('id', 'life-counter');
        lifeCounterElement.setAttribute('value', '0');
        domComponent.lifeCounter._element = lifeCounterElement;

        // UnDo
        const undo = () => {
            if (!playHistory.length) { return; }

            const action = playHistory.pop();
            const touchFunc = {
                'hand': touchFuncHand,
                'field': touchFuncPlay,
                'upField': touchFuncPlayUp
            }
            const undoFunc = {
                'setLand': (cardName, from, isFaceDown) => {
                    destroyLand(core, cardList.land.sprite);
                    setCard(
                        cardName, cardList[from], cardProperties[from],
                        cardProperties.imagePath, core, touchFunc[from],
                        isFaceDown
                    );
                },
                'discard': (cardName, from, isFaceDown) => {
                    setCard(
                        cardName, cardList[from], cardProperties[from],
                        cardProperties.imagePath, core, touchFunc[from],
                        isFaceDown
                    );
                    if (from === 'field') {
                        setCounter(
                            cardList.counter, cardProperties.counter,
                            cardList[from].sprite[cardList[from].sprite.length - 1], core
                        );
                    }
                }
            };
            undoFunc[action.type](action.cardName, action.from, action.isFaceDown);
            setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
        };

        const undoElement = document.createElement('button');
        undoElement.innerText = 'UNDO';
        undoElement.setAttribute('id', 'undo');
        undoElement.addEventListener('click', undo);
        domComponent.undo._element = undoElement;

        // サイコロ
        // 素材元：https://commons.nicovideo.jp/material/nc122454
        const diceRoll = () => {
            const diceNum = Math.floor(Math.random() * 6) + 1;
            diceElement.setAttribute('src', `${cardProperties.imagePath.component}6d_0${diceNum}.gif`);
        }

        const diceElement = document.createElement('img');
        diceElement.setAttribute('src', `${cardProperties.imagePath.component}6d_01.gif`);
        diceElement.addEventListener('click', diceRoll);
        domComponent.dice._element = diceElement;

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
                for (const type of Object.values(cardList)) {
                    // 描画の削除
                    for (const card of type.sprite) {
                        core.rootScene.removeChild(card);
                    }
                    // リストの初期化
                    for (const val of Object.values(type)) {
                        val.splice(0);
                    }
                }
                playHistory.splice(0);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
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
            setCard('token', fieldList, cardProperties.field, cardProperties.imagePath, core, touchFuncPlayToken);
            setCounter(cardList.counter, cardProperties.counter, fieldList.sprite[fieldList.sprite.length - 1], core);
        });

        fieldComponent.destroyLand.addEventListener('touchstart', () => {
            destroyLand(core, cardList.land.sprite);
        });

        socket.on('draw', function (data) {
            setCard(data, cardList.hand, cardProperties.hand, cardProperties.imagePath, core, touchFuncHand);
            setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
        });

        socket.on('opplay', function (data) {
            const opplayName = `${cardProperties.imagePath.card}${data}`;
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
            const targetCardName = cardList.hand.name[targetCardIdx];
            const isFaceDown = cardList.hand.isFaceDown[targetCardIdx];
            const operation = ['setLand', 'discard', 'play', 'cancel', 'reTower', 'zoom', 'faceUpDown'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.play.addEventListener('touchstart', function () {
                const fieldList = cardList.field;
                setCard(targetCardName, fieldList, cardProperties.field, cardProperties.imagePath, core, touchFuncPlay, isFaceDown);
                setCounter(cardList.counter, cardProperties.counter, fieldList.sprite[fieldList.sprite.length - 1], core);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                if (!isFaceDown) { socket.emit('play', targetCardName); };
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                faceUpDown(targetCardIdx, cardList.hand, cardProperties.imagePath, componentProp, core);
                touchRemoveFunc();
            });

            operationSprite.setLand.addEventListener('touchstart', function () {
                setCard('land', cardList.land, cardProperties.land, cardProperties.imagePath, core, touchFuncLand);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                playHistory.push({ type: 'setLand', cardName: targetCardName, from: 'hand', isFaceDown: isFaceDown });
            });

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                playHistory.push({ type: 'discard', cardName: targetCardName, from: 'hand', isFaceDown: isFaceDown });
            });

            operationSprite.cancel.addEventListener('touchstart', function () {
                touchRemoveFunc();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                socket.emit('return', targetCardName);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.hand, core);
                touchRemoveFunc();
            });

            touchRemoveFunc();
            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
            displayedOpSprite = operationSprite;
        };

        // touch function field card
        var touchFuncPlay = function () {
            const targetCard = this;
            const targetCardIdx = cardList.field.sprite.findIndex((card) => card === targetCard);
            const targetCardName = cardList.field.name[targetCardIdx];
            const isFaceDown = cardList.field.isFaceDown[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right',
                'up', 'reHand', 'reTower', 'zoom', 'faceUpDown'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                playHistory.push({ type: 'discard', cardName: targetCardName, from: 'field', isFaceDown: isFaceDown });
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
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                setCard(targetCardName, cardList.hand, cardProperties.hand, cardProperties.imagePath, core, touchFuncHand);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
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
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                setCard(targetCardName, cardList.upField, cardProperties.upField, cardProperties.imagePath, core, touchFuncPlayUp, isFaceDown);
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
                zoomCard(targetCard.image, cardProperties.field, core);
                touchRemoveFunc();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                socket.emit('return', targetCardName);
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                faceUpDown(targetCardIdx, cardList.field, cardProperties.imagePath, componentProp, core);
                touchRemoveFunc();
                if (isFaceDown) { socket.emit('play', targetCardName); };
            });

            touchRemoveFunc();
            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
            displayedOpSprite = operationSprite;

        };

        var touchFuncPlayToken = function () {
            const targetCard = this;
            const targetCardIdx = cardList.field.sprite.findIndex((card) => card === targetCard);
            const operation = ['discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
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

            operationSprite.left.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx > 0) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx - 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx - 1], counterList);
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

            touchRemoveFunc();
            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
            displayedOpSprite = operationSprite;

        };

        var touchFuncPlayUp = function () {
            const targetCard = this;
            const targetCardIdx = cardList.upField.sprite.findIndex((card) => card === targetCard);
            const targetCardName = cardList.upField.name[targetCardIdx];
            const isFaceDown = cardList.upField.isFaceDown[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'reHand', 'reTower', 'zoom', 'faceUpDown'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.upField, core, touchRemoveFunc);
                playHistory.push({ type: 'discard', cardName: targetCardName, from: 'upField', isFaceDown: isFaceDown });
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
                removeCard(targetCard, cardList.upField, cardProperties.upField, core, touchRemoveFunc);
                setCard(targetCardName, cardList.hand, cardProperties.hand, cardProperties.imagePath, core, touchFuncHand);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.upField, core);
                touchRemoveFunc();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.upField, core, touchRemoveFunc);
                socket.emit('return', targetCardName);
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                faceUpDown(targetCardIdx, cardList.upField, cardProperties.imagePath, componentProp, core);
                touchRemoveFunc();
                if (isFaceDown) { socket.emit('play', targetCardName); }
            });

            touchRemoveFunc();
            for (const op of operation) {
                core.currentScene.addChild(operationSprite[op]);
            }
            displayedOpSprite = operationSprite;

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

        // DOMコンポーネントの描画 (Entity)
        for (const cmpnt of Object.values(domComponent)) {
            core.rootScene.addChild(cmpnt);
        }

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
