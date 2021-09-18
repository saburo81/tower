enchant(); // enchantjs おまじない
import {
    setCard, removeCard, swapCard, tapCard, untapCard, faceUpDown, faceFrontBack,
    rotateTokenImg, destroyLand, setCounter, setCounterNum, removeCounter,
    swapCounter, zoomCard, setMemo, setMemoText, removeMemo, swapMemo,
    addMemoExecuteHandler, removeMemoExecuteHandler
} from './modules/action.js';

var socket = io();
var SCREEN_WIDTH = 1680; //スクリーン幅
var SCREEN_HEIGHT = 960; //スクリーン高さ

window.onload = function () {
    const core = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
    core.rootScene.backgroundColor = "green";

    const playHistory = [];

    const cardList = {
        hand: { sprite: [], name: [], backName: [], isFaceBack: [], isFaceDown: [] },
        land: { sprite: [], name: [] },
        field: { sprite: [], name: [], backName: [], isFaceBack: [], isFaceDown: [] },
        upField: { sprite: [], name: [], backName: [], isFaceBack: [], isFaceDown: [] },
        counter: { sprite: [], number: [] },  // spriteに格納されるのはLabelオブジェクト
        memo: { sprite: [], backSprite: [] },  // spriteに格納されるのはLabelオブジェクト
        upMemo: { sprite: [], backSprite: [] }  // spriteに格納されるのはLabelオブジェクト
    }

    // 禁止カードリスト
    let banList = [];

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
        memo: { width: 115, height: 51, x: 53, y: 181 },
        imagePath: {
            card: 'images/cards/',
            backFace: 'images/cards/back-face/',
            component: 'images/components/'
        }
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
            up: { imgName: 'up.jpg', width: 61, height: 59, offset: { x: -32, y: 20 }, scale: 1.0 },
            memo: { imgName: 'memo.jpg', width: 256, height: 256, offset: { x: 175, y: -68 }, scale: 0.23 }
        },
        field: {
            cardBack: { imgName: 'back_image.jpg', x: SCREEN_WIDTH / 2 - 50, y: -70, scale: 0.7, rotation: 90 },
            untapAll: { imgName: 'untap.jpg', x: 10, y: 300, scale: 1.0, rotation: 0 },
            addToken: { imgName: 'token.jpg', x: -45, y: 360, scale: 0.6, rotation: 0 },
            destroyLand: { imgName: 'destroyland.jpg', x: 10, y: 450, scale: 1.0, rotation: 0 }
        },
        card: {
            land: { imgName: 'tower_land.jpg' },
            token: [
                { imgName: 'token_mao.jpg' },
                { imgName: 'token_shion.jpg' },
                { imgName: 'token_megu.jpg' },
                { imgName: 'token_kirara.jpg' },
                { imgName: 'token_tama.jpg' },
                { imgName: 'token_kyoro.jpg' }
            ]
        }, 
        dom: {
            playOrder: { width: 56, height: 56, x: 5, y: 10 },
            playerName: { width: 150, height: 50, x: 75, y: 10 },
            handCardNum: { width: 125, height: 50, x: 1100, y: 10 },
            lifeCounter: { width: 100, height: 50, x: 1250, y: 10 },
            menu: { width: 100, height: 50, x: SCREEN_WIDTH - 300, y: 10 },
            undo: { width: 110, height: 50, x: 10, y: 245 },
            dice: { width: 76, height: 76, x: 25, y: 150 }
        }
    };

    // コンポーネント画像のロード
    for (const category of Object.values(componentProp)) {
        for (const prop of Object.values(category)) {
             if (prop.hasOwnProperty('imgName')) {
                core.preload(`${cardProperties.imagePath.component}${prop.imgName}`);
             } else if (Array.isArray(prop)) {
                 for (let i = 0; i < prop.length; i++) {
                     core.preload(`${cardProperties.imagePath.component}${prop[i].imgName}`);
                 }
             }
        }
    }

    // カード画像のロード
    for (let i = 0; i < cardImages.front.length; i++) {
        const precard = `${cardProperties.imagePath.card}${cardImages.front[i]}`;
        core.preload(precard);
    };
    for (let i = 0; i < cardImages.back.length; i++) {
        const precard = `${cardProperties.imagePath.backFace}${cardImages.back[i]}`;
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
            menu: new Entity(),
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
        const playOrderElement = document.createElement('a');
        playOrderElement.setAttribute('id', 'playOrder');
        playOrderElement.setAttribute('class', 'btn red lighten-2');
        playOrderElement.innerText = 1;
        playOrderElement.onclick = function () {
            this.innerText = this.innerText++ % 4 + 1;
            if (this.innerText % 2 != 0) {
                this.setAttribute('class', 'btn red lighten-2');
            } else {
                this.setAttribute('class', 'btn blue lighten-2');
            };
        };
        domComponent.playOrder._element = playOrderElement;

        // プレイヤー名
        const playerNameElement = document.createElement('input');
        playerNameElement.setAttribute('type', 'text');
        playerNameElement.setAttribute('maxlength', '10');
        playerNameElement.setAttribute('id', 'name');
        playerNameElement.setAttribute('placeholder', 'Name');
        domComponent.playerName._element = playerNameElement;

        // 手札枚数
        const handCardNumElement = document.createElement('p');
        handCardNumElement.setAttribute('id', 'hand-card-num');
        domComponent.handCardNum._element = handCardNumElement;
        setHandCardNum(handCardNumElement, cardList.hand.sprite.length);

        // ライフカウンター
        const lifeCounterElement = document.createElement('input');
        lifeCounterElement.setAttribute('type', 'number');
        lifeCounterElement.setAttribute('id', 'life-counter');
        lifeCounterElement.setAttribute('value', '0');
        domComponent.lifeCounter._element = lifeCounterElement;

        // メニュー
        const menuElement = document.createElement('a');
        menuElement.setAttribute('id', 'menu');
        menuElement.setAttribute('class', 'sidenav-trigger btn blue lighten-2');
        menuElement.setAttribute('data-target', 'slide-out');
        menuElement.innerText = 'メニュー';
        domComponent.menu._element = menuElement;

        // 盤面リセット (サイドバー操作)
        const resetExecuteButton = document.getElementById('field-reset-execute');
        resetExecuteButton.addEventListener('click', function () {
            for (const type of Object.values(cardList)) {
                // 描画の削除
                for (const card of type.sprite) {
                    core.rootScene.removeChild(card);
                }
                if ('backSprite' in type) {
                    for (const sprite of type.backSprite) {
                        core.rootScene.removeChild(sprite);
                    }
                }
                // リストの初期化
                for (const val of Object.values(type)) {
                    val.splice(0);
                }
            }
            playHistory.splice(0);
            setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
        });

        // タワー再構築 (サイドバー操作)
        const makeTowerExexuteButton = document.getElementById('make-tower-execute');
        makeTowerExexuteButton.addEventListener('click', function () {
            socket.emit('maketower');
        });

        // 禁止カードリスト更新 (サイドバー操作)
        // DataTablesは内部データが更新されても表示が更新されないため
        // モーダル表示の度にDataTableを手動で更新する
        const banListElement = document.getElementById('ban-list-sidenav');
        banListElement.addEventListener('click', function () {
            refreshDataTables();
        });

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
                'setLand': (cardName, backName, from, isFaceBack, isFaceDown) => {
                    destroyLand(core, cardList.land.sprite);
                    setCard(
                        cardName, cardList[from], cardProperties[from],
                        cardProperties.imagePath, core, touchFunc[from],
                        isFaceDown, isFaceBack, backName,
                    );
                },
                'discard': (cardName, backName, from, isFaceBack, isFaceDown) => {
                    setCard(
                        cardName, cardList[from], cardProperties[from],
                        cardProperties.imagePath, core, touchFunc[from],
                        isFaceDown, isFaceBack, backName,
                    );
                    if (from === 'field') {
                        setCounter(
                            cardList.counter, cardProperties.counter,
                            cardList[from].sprite[cardList[from].sprite.length - 1], core
                        );
                    }
                }
            };
            undoFunc[action.type](action.cardName, action.backName, action.from, action.isFaceBack, action.isFaceDown);
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
            setMemo(cardList.memo, cardProperties.memo, fieldList.sprite[fieldList.sprite.length - 1], core);
        });

        fieldComponent.destroyLand.addEventListener('touchstart', () => {
            destroyLand(core, cardList.land.sprite);
        });

        socket.on('draw', function (card) {
            setCard(
                card.front, cardList.hand, cardProperties.hand, cardProperties.imagePath,
                core, touchFuncHand, false, false, card.back
            );
            setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
        });

        socket.on('opplay', function (card) {
            const opplayName = (card.face === 'front') ?
                `${cardProperties.imagePath.card}${card.name}` :
                `${cardProperties.imagePath.backFace}${card.name}`;
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
            const targetBackName = cardList.hand.backName[targetCardIdx];
            const isFaceBack = cardList.hand.isFaceBack[targetCardIdx];
            const isFaceDown = cardList.hand.isFaceDown[targetCardIdx];
            const operation = ['setLand', 'discard', 'play', 'cancel', 'reTower', 'zoom', 'faceUpDown'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.play.addEventListener('touchstart', function () {
                const fieldList = cardList.field;
                setCard(
                    targetCardName, fieldList, cardProperties.field, cardProperties.imagePath, core, touchFuncPlay,
                    isFaceDown, isFaceBack, targetBackName
                );
                setCounter(cardList.counter, cardProperties.counter, fieldList.sprite[fieldList.sprite.length - 1], core);
                setMemo(cardList.memo, cardProperties.memo, fieldList.sprite[fieldList.sprite.length - 1], core);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                if (!isFaceDown) {
                    if (!isFaceBack) {
                        socket.emit('play', {'face': 'front', 'name': targetCardName});
                    } else {
                        socket.emit('play', {'face': 'back', 'name': targetBackName});
                    }
                }
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                if (isFaceBack || !targetBackName) {
                    faceUpDown(targetCardIdx, cardList.hand, cardProperties.imagePath, componentProp, core);
                }
                if (isFaceBack === isFaceDown && targetBackName) {
                    faceFrontBack(targetCardIdx, cardList.hand, cardProperties.imagePath, core);
                }
                touchRemoveFunc();
            });

            operationSprite.setLand.addEventListener('touchstart', function () {
                setCard('land', cardList.land, cardProperties.land, cardProperties.imagePath, core, touchFuncLand);
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                playHistory.push({
                    type: 'setLand', cardName: targetCardName, backName: targetBackName,
                    from: 'hand', isFaceBack: isFaceBack, isFaceDown: isFaceDown
                });
            });

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.hand, cardProperties.hand, core, touchRemoveFunc);
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
                playHistory.push({
                    type: 'discard', cardName: targetCardName, backName: targetBackName,
                    from: 'hand', isFaceBack: isFaceBack, isFaceDown: isFaceDown
                });
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
            const targetBackName = cardList.field.backName[targetCardIdx];
            const isFaceBack = cardList.field.isFaceBack[targetCardIdx];
            const isFaceDown = cardList.field.isFaceDown[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right',
                'up', 'reHand', 'reTower', 'zoom', 'faceUpDown', 'memo'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                removeMemo(cardList.memo, targetCardIdx, core);
                playHistory.push({
                    type: 'discard', cardName: targetCardName, backName: targetBackName,
                    from: 'field', isFaceBack: isFaceBack, isFaceDown: isFaceDown
                });
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
                removeMemo(cardList.memo, targetCardIdx, core);
                setCard(
                    targetCardName, cardList.hand, cardProperties.hand, cardProperties.imagePath, core, touchFuncHand,
                    isFaceDown, isFaceBack, targetBackName
                );
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
            });

            operationSprite.left.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx > 0) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx - 1], cardList.field);
                    swapCounter( counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx - 1], counterList );
                    swapMemo(cardList.memo, targetCardIdx, targetCardIdx - 1);
                };
                touchRemoveFunc();
            });

            operationSprite.right.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx < cardList.field.sprite.length - 1) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx + 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx + 1], counterList);
                    swapMemo(cardList.memo, targetCardIdx, targetCardIdx + 1);
                };
                touchRemoveFunc();
            });

            operationSprite.up.addEventListener('touchstart', function () {
                const memoTxt = cardList.memo.sprite[targetCardIdx].text.replace(/<br>/g, "\n");
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                removeMemo(cardList.memo, targetCardIdx, core);
                setCard(
                    targetCardName, cardList.upField, cardProperties.upField, cardProperties.imagePath, core, touchFuncPlayUp,
                    isFaceDown, isFaceBack, targetBackName
                );
                const memoIdx = cardList.upField.sprite.length - 1;
                setMemo(cardList.upMemo, cardProperties.memo, cardList.upField.sprite[memoIdx], core);
                setMemoText(cardList.upMemo.sprite[memoIdx], cardList.upMemo.backSprite[memoIdx], memoTxt);
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
                removeMemo(cardList.memo, targetCardIdx, core);
                socket.emit('return', targetCardName);
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                if (isFaceBack || !targetBackName) {
                    faceUpDown(targetCardIdx, cardList.field, cardProperties.imagePath, componentProp, core);
                }
                if (targetBackName && isFaceBack === isFaceDown) {
                    faceFrontBack(targetCardIdx, cardList.field, cardProperties.imagePath, core);
                }
                touchRemoveFunc();
                if (isFaceDown) {
                    socket.emit('play', {'face': 'front', 'name': targetCardName});
                } else if (targetBackName && !isFaceBack) {
                    socket.emit('play', {'face': 'back', 'name': targetBackName});
                }
            });

            operationSprite.memo.addEventListener('touchstart', function () {
                const handlerObj = addMemoExecuteHandler(cardList.memo, targetCardIdx);
                removeMemoExecuteHandler(handlerObj);

                const memoModal = M.Modal.getInstance(document.getElementById('memo-modal'));
                const memoInput = document.getElementById("memo-input");
                memoInput.value = cardList.memo.sprite[targetCardIdx].text.replace(/<br>/g, "\n");
                memoModal.open();
                touchRemoveFunc();
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
            const operation = ['discard', 'tap', 'cancel', 'plus', 'minus', 'left', 'right', 'faceUpDown', 'memo'];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.field, cardProperties.field, core, touchRemoveFunc);
                removeCounter(cardList.counter.sprite[targetCardIdx], cardList.counter, core);
                removeMemo(cardList.memo, targetCardIdx, core);
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
                    swapMemo(cardList.memo, targetCardIdx, targetCardIdx - 1);
                };
                touchRemoveFunc();
            });

            operationSprite.right.addEventListener('touchstart', function () {
                const counterList = cardList.counter;
                if (targetCardIdx < cardList.field.sprite.length - 1) {
                    swapCard(targetCard, cardList.field.sprite[targetCardIdx + 1], cardList.field);
                    swapCounter(counterList.sprite[targetCardIdx], counterList.sprite[targetCardIdx + 1], counterList);
                    swapMemo(cardList.memo, targetCardIdx, targetCardIdx + 1);
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

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                rotateTokenImg(targetCardIdx, cardList.field, cardProperties.imagePath, componentProp, core);
                touchRemoveFunc();
            });

            operationSprite.memo.addEventListener('touchstart', function () {
                const handlerObj = addMemoExecuteHandler(cardList.memo, targetCardIdx);
                removeMemoExecuteHandler(handlerObj);

                const memoModal = M.Modal.getInstance(document.getElementById('memo-modal'));
                const memoInput = document.getElementById("memo-input");
                memoInput.value = cardList.memo.sprite[targetCardIdx].text.replace(/<br>/g, "\n");
                memoModal.open();
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
            const targetBackName = cardList.upField.backName[targetCardIdx];
            const isFaceBack = cardList.upField.isFaceBack[targetCardIdx];
            const isFaceDown = cardList.upField.isFaceDown[targetCardIdx];
            const operation = [
                'discard', 'tap', 'cancel', 'reHand', 'reTower', 'zoom', 'faceUpDown', 'memo'
            ];
            const operationSprite = createOperationSprite(targetCard, operation, componentProp.operation);

            operationSprite.discard.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.upField, core, touchRemoveFunc);
                removeMemo(cardList.upMemo, targetCardIdx, core);
                playHistory.push({
                    type: 'discard', cardName: targetCardName, backName: targetBackName,
                    from: 'upField', isFaceBack: isFaceBack, isFaceDown: isFaceDown
                });
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
                removeMemo(cardList.upMemo, targetCardIdx, core);
                setCard(
                    targetCardName, cardList.hand, cardProperties.hand, cardProperties.imagePath, core, touchFuncHand,
                    isFaceDown, isFaceBack, targetBackName
                );
                setHandCardNum(handCardNumElement, cardList.hand.sprite.length);
            });

            operationSprite.zoom.addEventListener('touchstart', function () {
                zoomCard(targetCard.image, cardProperties.upField, core);
                touchRemoveFunc();
            });

            operationSprite.reTower.addEventListener('touchstart', function () {
                removeCard(targetCard, cardList.upField, cardProperties.upField, core, touchRemoveFunc);
                removeMemo(cardList.upMemo, targetCardIdx, core);
                socket.emit('return', targetCardName);
            });

            operationSprite.faceUpDown.addEventListener('touchstart', function () {
                if (isFaceBack || !targetBackName) {
                    faceUpDown(targetCardIdx, cardList.upField, cardProperties.imagePath, componentProp, core);
                }
                if (targetBackName && isFaceBack === isFaceDown) {
                    faceFrontBack(targetCardIdx, cardList.upField, cardProperties.imagePath, core);
                }
                touchRemoveFunc();
                if (isFaceDown) {
                    socket.emit('play', {'face': 'front', 'name': targetCardName});
                } else if (targetBackName && !isFaceBack) {
                    socket.emit('play', {'face': 'back', 'name': targetBackName});
                }
            });

            operationSprite.memo.addEventListener('touchstart', function () {
                const handlerObj = addMemoExecuteHandler(cardList.upMemo, targetCardIdx);
                removeMemoExecuteHandler(handlerObj);

                const memoModal = M.Modal.getInstance(document.getElementById('memo-modal'));
                const memoInput = document.getElementById("memo-input");
                memoInput.value = cardList.upMemo.sprite[targetCardIdx].text.replace(/<br>/g, "\n");
                memoModal.open();
                touchRemoveFunc();
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

        // サイドバー初期化
        const sidenavElems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(sidenavElems, { 'edge': 'right' });

        // モーダル初期化
        const modalElems = document.querySelectorAll('.modal');
        M.Modal.init(modalElems);

        // ツールチップ初期化（禁止カード）
        const banToolTipElems = document.getElementById('ban-list-info');
        const banToolTipHtml = '許可：要タワー再構築<br>' +
            '禁止：即時反映<br>' +
            'Searchで「禁止/ 許可」絞り込み可能<br>' +
            '変になったら一旦モーダルを閉じて<br>' +
            '開き直すと上手くいったりする'
        M.Tooltip.init(banToolTipElems, { 'html': banToolTipHtml });

        // 禁止カードリスト取得
        // DataTable表示中に他プレイヤーが禁止カードリストを更新した際に
        // 表示中のDataTableへ更新を反映させるためのイベントハンドラ
        socket.on('updateBanList', function (data) {
            banList = data;
            refreshDataTables();
        });

        // DataTablesの更新
        // banListの更新をDataTablesに反映
        const refreshDataTables = () => {
            for (let i = 0; i < dataTableData.length; i++) {
                const data = dataTableData[i];
                data.banned = banList.includes(data.name);
                data.filterIdx = data.banned ? '禁止' : '許可';
            }
            const datatable = $('#ban-list-table').DataTable();
            datatable.clear();
            datatable.search('');
            datatable.rows.add(dataTableData);
            datatable.draw();

            // 禁止リスト更新スイッチ
            // datatable.clearを実行することで禁止リスト更新スイッチに
            // 紐付けたイベントハンドラも消える
            // そのためDataTable更新の度にイベントハンドラを紐付けし直す
            const banListSwitches = document.querySelectorAll('.banList');
            for (let i = 0; i < banListSwitches.length; i++) {
                const datatable = $('#ban-list-table').DataTable();
                const banListSwitch = banListSwitches[i];
                banListSwitch.addEventListener('click', event => {
                    const trElem = event.target.closest('tr');
                    const switchText = trElem.querySelector('span');
                    let banStatus = '';
                    if (event.target.checked) {
                        const index = banList.indexOf(event.target.value);
                        if (index > -1) {
                            banList.splice(index, 1);
                        }
                        event.target.removeAttribute('checked');
                        banStatus = '許可';
                    } else {
                        banList.push(event.target.value);
                        event.target.setAttribute('checked', '');
                        banStatus = '禁止';
                    }
                    switchText.innerText = banStatus;
                    datatable.row(trElem).data().filterIdx = banStatus;
                    // 重複要素の削除
                    // 基本的には重複要素は登録されないが他プレイヤーの
                    // 更新タイミング次第で重複要素が登録される可能性がある
                    banList = Array.from(new Set(banList));
                    socket.emit('banList', { 'type': 'update', 'banList': banList });
                });
            }
        }

        // DataTable初期化
        const dataTableData = cardImages.front.map(card => {
            return {
                'banned': banList.includes(card),
                'name': card,
                'filterIdx': banList.includes(card) ? '禁止' : '許可'
            }
        });
        $('#ban-list-table').DataTable({
            'data': dataTableData,
            'columns': [
                {
                    'data': 'banned',
                    'title': 'Status',
                    'render': function (data, type, row, meta) {
                        const switchHTML = '<div class="switch">' +
                            '<label>' +
                            `<span>${!data ? "許可" : "禁止"}</span>` +
                            `<input type="checkbox" class="banList" value="${row.name}"` +
                            `${!data ? "checked" : ""}>` +
                            '<span class="lever"></span>' +
                            '</label>' +
                            '</div>';
                        return switchHTML;
                    }
                },
                {
                    'data': 'name',
                    'title': 'Card Name'
                },
                {
                    'data': 'filterIdx',
                    'title': '検索用',
                    'className': 'filterIdx',
                    'visible': false
                }
            ],
            'order': [1, 'asc'],
            'paging': false
        });

        // 禁止リスト初回取得リクエスト
        socket.emit('banList', { 'type': 'get' });

        // ツールチップ初期化（カードアップロード）
        const uploadToolTipElems = document.getElementById('card-upload-info');
        const uploadToolTipHtml = '同名ファイルが存在する場合は上書きされる<br>' +
            '設定反映には下記操作が必要<br>' +
            '- タワー再構築<br>' +
            '- 全プレイヤーページ更新'
        M.Tooltip.init(uploadToolTipElems, { 'html': uploadToolTipHtml });

        // DataTable初期化
        const datatable = $('#upload-file-list').DataTable({
            'data': [],
            'columns': [
                {
                    'data': 'frontFace',
                    'title': 'Front Face Card Name'
                },
                {
                    'data': 'backFace',
                    'title': 'Back Face Card Name',
                    'render': function (data, type, row, meta) {
                        return `<input type="file" id=back-face-card-upload-${meta.row} ` +
                            'accept="image/*" style="width: 100%;">'
                    }
                }
            ],
            'order': [1, 'asc'],
            'paging': false,
            'searching': false,
            'info': false
        });
        const datatableWrapper = document.getElementById("upload-file-list_wrapper");
        datatableWrapper.hidden = true;

        // アップロードファイル選択
        const frontFaceFileInput = document.getElementById("front-face-card-upload");
        frontFaceFileInput.addEventListener("change", function (e) {
            const data = Array.from(e.target.files).map(file => {
                return {
                    'frontFace': file['name'],
                    'backFace': ""
                }
            })
            datatable.clear().rows.add(data).draw();
            datatableWrapper.hidden = false;
        });

        // ファイルアップロード
        const fileUpload = document.getElementById("card-upload-execute");
        fileUpload.addEventListener("click", function (e) {
            const frontFaceCards = frontFaceFileInput.files;
            let formData = new FormData();
            for (let i = 0; i < frontFaceCards.length; i++) {
                const backFaceFileInput = document.getElementById(`back-face-card-upload-${i}`);
                const backFaceCard = (backFaceFileInput.files) ? backFaceFileInput.files[0] : null;
                formData.append('frontFaceCardImages', frontFaceCards[i]);
                if (backFaceCard) {
                    formData.append('backFaceCardImages', backFaceCard);
                }
                formData.append('doubleFaceCardList', JSON.stringify(
                    {
                        "front": frontFaceCards[i].name,
                        "back": (backFaceCard) ? backFaceCard.name : null
                    }
                ));
            }

            $.ajax({
                url: '/api/cards',
                method: 'post',
                data: formData,
                processData: false,
                contentType: false
            }).done(function (res) {
                M.toast({ html: res, classes: 'rounded teal lighten-2' });
            }).fail(function (err) {
                M.toast({ html: err, classes: 'rounded red lighten-2' });
            })
            frontFaceFileInput.value = "";
            datatable.clear().draw();
            datatableWrapper.hidden = true;
        })

        // アップロードキャンセル
        const fileCancel = document.getElementById("card-upload-cancel");
        fileCancel.addEventListener("click", function (e) {
            frontFaceFileInput.value = "";
            datatable.clear().draw();
            datatableWrapper.hidden = true;
        });
    };
    core.start();
};

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});