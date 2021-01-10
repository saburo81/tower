/* カード操作に関する関数 */

// カードを配置する
//   cardName: カード番号
//   dstCardList: 配置する場のカードリスト
//   dstCardProp: 配置する場のカードプロパティ
//   imagePath: カード画像ディレクトリへのパス
//   core: EnchantJSオブジェクト
//   touchFunc: カードクリック時に呼び出す関数
export const setCard = (cardName, dstCardList, dstCardProp, imagePath, core,
    touchFunc, isFaceDown = false) => {
    // カードを生成
    const cardMap = {
        'token': { type: 'token', name: `${imagePath.component}maotoken.jpg` },
        'land': { type: 'land', name: `${imagePath.component}tower_land.jpg` }
    };
    const cardInfo = cardMap[cardName] || { type: 'card', name: `${imagePath.card}${cardName}` };
    const card = new Sprite(dstCardProp.image.width, dstCardProp.image.height);
    card.image = (isFaceDown) ?
        core.assets[`${imagePath.component}back_image.jpg`] :
        core.assets[cardInfo.name];
    card.scaleX = dstCardProp.image.scale;
    card.scaleY = dstCardProp.image.scale;
    card.moveTo(
        dstCardProp.field.x + dstCardList.sprite.length * Math.ceil(dstCardProp.image.width * dstCardProp.image.scale),
        dstCardProp.field.y
    );
    card.ontouchstart = touchFunc;
    core.currentScene.addChild(card);

    // カードリストの更新
    dstCardList.sprite.push(card);
    if (cardInfo.type !== 'land') {
        dstCardList.name.push(cardName);
        dstCardList.isFaceDown.push(isFaceDown);
    }
}

// 指定されたカードを取り除く
//   targetCard: 対象とするカードのSpriteオブジェクト
//   targetCardList: 配置する場のカードリスト
//   targetCardProp: 配置する場のカードプロパティ
//   core: EnchantJSオブジェクト
//   touchRemoveFunc: カードを取り除く際に呼び出す関数
export const removeCard = (targetCard, targetCardList, targetCardProp, core,
    touchRemoveFunc) => {
    const discardIdx = targetCardList.sprite.findIndex((card) => card.x === targetCard.x);
    const discardSet = targetCardList.sprite[discardIdx];
    core.currentScene.removeChild(discardSet);
    for (let j = discardIdx + 1; j < targetCardList.sprite.length; ++j) {
        const moveCard = targetCardList.sprite[j];
        moveCard.moveTo(
            moveCard.x - Math.ceil(targetCardProp.image.width * targetCardProp.image.scale),
            targetCardProp.field.y
        );
    };
    targetCardList.sprite.splice(discardIdx, 1);
    targetCardList.name.splice(discardIdx, 1);
    targetCardList.isFaceDown.splice(discardIdx, 1);
    touchRemoveFunc();
}

// 同じ場の指定カード位置を入れ替える
//   cardA: 対象とするカードのSpriteオブジェクト
//   cardB: 対象とするカードのSpriteオブジェクト
//   targetCardList: 配置する場のカードリスト
export const swapCard = (cardA, cardB, targetCardList) => {
    const cardAIdx = targetCardList.sprite.findIndex((card) => card === cardA);
    const cardAName = targetCardList.name[cardAIdx];
    const cardACoord = { x: cardA.x, y: cardA.y };
    const cardAisFaceDown = targetCardList.isFaceDown[cardAIdx];
    const cardBIdx = targetCardList.sprite.findIndex((card) => card === cardB);
    const cardBName = targetCardList.name[cardBIdx];
    const cardBCoord = { x: cardB.x, y: cardB.y };
    const cardBisFaceDown = targetCardList.isFaceDown[cardBIdx];

    cardA.moveTo(cardBCoord.x, cardBCoord.y);
    cardB.moveTo(cardACoord.x, cardACoord.y);

    targetCardList.sprite[cardAIdx] = cardB;
    targetCardList.sprite[cardBIdx] = cardA;
    targetCardList.name[cardAIdx] = cardBName;
    targetCardList.name[cardBIdx] = cardAName;
    targetCardList.isFaceDown[cardAIdx] = cardBisFaceDown;
    targetCardList.isFaceDown[cardBIdx] = cardAisFaceDown;
}

// カードをタップする
//   card: 対象とするカードのSpriteオブジェクト
export const tapCard = (card) => {
    card.rotation = 90;
}

// カードをアンタップする
//   card: 対象とするカードのSpriteオブジェクト
export const untapCard = (card) => {
    card.rotation = 0;
}

// カードの裏表を入れ替える
//   cardIdx: 対象とするカードのカードリストにおけるインデックス
//   cardList: 対象とするカードのカードリスト
//   imagePath: カードのベースパス
//   cmpntProp: コンポーネントのプロパティ
export const faceUpDown = (cardIdx, cardList, imagePath, cmpntProp, core) => {
    const cardName = cardList.name[cardIdx];
    const isFaceDown = cardList.isFaceDown[cardIdx];
    cardList.sprite[cardIdx].image = (isFaceDown) ?
        core.assets[`${imagePath.card}${cardName}`] :
        core.assets[`${imagePath.component}${cmpntProp.field.cardBack.imgName}`];
    cardList.isFaceDown[cardIdx] = !isFaceDown;
}

// 一番右の土地を破壊する
//   core: EnchantJSオブジェクト
//   landList: 土地のカードリスト
export const destroyLand = (core, landList) => {
    // カード描画
    const targetLand = landList[landList.length - 1];
    core.currentScene.removeChild(targetLand);

    // 土地情報の更新
    landList.pop();
}

// カウンターを配置する
//   counterList: カウンターのリスト
//   counterProp: カウンターのプロパティ
//   card: カウンターを付与するカードのSpriteオブジェクト
export const setCounter = (counterList, counterProp, card, core) => {
    // カードを生成
    const counter = new Label();
    counter.font = "normal normal 30px/1.0 monospace";
    counter.moveTo(card.x + counterProp.x, card.y + counterProp.y);
    core.currentScene.addChild(counter);
    counterList.sprite.push(counter);
    counterList.number.push(0);
}

// カウンターの数値を設定する
//   counter: カウンターのLabelオブジェクト
//   counterNum: 設定するカウンターの数値
//   counterNumList: カウンター数値のリスト
export const setCounterNum = (counter, counterNum, counterList) => {
    const counterIdx = counterList.sprite.findIndex((label) => label === counter);
    if (counterNum > 0) {
        counter.text = `+${counterNum}/+${counterNum}`;
    } else if (counterNum < 0) {
        counter.text = `${counterNum}/${counterNum}`;
    } else {
        counter.text = '';
    };
    counterList.number[counterIdx] = counterNum;
}

// カウンターを取り除く
//   counter: カウンターのLabelオブジェクト
//   counterList: カウンターのリスト
//   core: EnchantJSオブジェクト
export const removeCounter = (counter, counterList, core) => {
    const counterIdx = counterList.sprite.findIndex((label) => label === counter);
    core.rootScene.removeChild(counter);
    for (let i = counterList.sprite.length - 1; i > counterIdx; i--) {
        const rightLabel = counterList.sprite[i];
        const leftLabel = counterList.sprite[i - 1];
        rightLabel.moveTo(leftLabel.x, leftLabel.y);
    };
    counterList.sprite.splice(counterIdx, 1);
    counterList.number.splice(counterIdx, 1);
}

// 同じ場の指定カウンター位置を入れ替える
//   counterA: 対象とするカウンターのLabelオブジェクト
//   counterB: 対象とするカウンターのLabelオブジェクト
//   targetCounterList: 配置する場のカウンターリスト
export const swapCounter = (counterA, counterB, targetCounterList) => {
    const counterAIdx = targetCounterList.sprite.findIndex((cnt) => cnt === counterA);
    const counterANum = targetCounterList.number[counterAIdx];
    const counterACoord = { x: counterA.x, y: counterA.y };
    const counterBIdx = targetCounterList.sprite.findIndex((cnt) => cnt === counterB);
    const counterBNum = targetCounterList.number[counterBIdx];
    const counterBCoord = { x: counterB.x, y: counterB.y };

    counterA.moveTo(counterBCoord.x, counterBCoord.y);
    counterB.moveTo(counterACoord.x, counterACoord.y);

    targetCounterList.sprite[counterAIdx] = counterB;
    targetCounterList.sprite[counterBIdx] = counterA;
    targetCounterList.number[counterAIdx] = counterBNum;
    targetCounterList.number[counterBIdx] = counterANum;
}

// カードを拡大表示する
//   cardImage: 対象とするカードのimage
//   core: EnchantJSオブジェクト
//   targetCardProp: cardが配置されている場のカードプロパティ
//   label: 拡大イメージに付けるラベル (option)
export const zoomCard = (cardImage, cardProp, core, label) => {
    const card = new Sprite(cardProp.image.width, cardProp.image.height);
    card.image = cardImage;
    card.scaleX = cardProp.zoom.scale;
    card.scaleY = cardProp.zoom.scale;
    card.x = cardProp.zoom.x;
    card.y = cardProp.zoom.y;
    card.addEventListener('touchstart', function () {
        core.currentScene.removeChild(this);
        if (label) {
            core.currentScene.removeChild(label);
        }
    });
    if (label) {
        core.currentScene.addChild(label);
    }
    core.currentScene.addChild(card);
}

// メモを配置する
//   memoList: メモのリスト
//   memoProp: メモのプロパティ
//   card: メモを付与するカードのSpriteオブジェクト
export const setMemo = (memoList, memoProp, card, core) => {
    // メモ背景
    const memoBack = new Sprite(memoProp.width, memoProp.height);
    const memoBackSurface = new Surface(memoProp.width, memoProp.height);
    memoBack.image = memoBackSurface;
    memoBackSurface.context.fillStyle = "white";
    memoBackSurface.context.fillRect(0, 0, memoProp.width, memoProp.height);;
    memoBack.moveTo(card.x + memoProp.x, card.y + memoProp.y);
    memoBack.visible = false;

    // メモテキスト
    const memo = new Label();
    memo.font = "normal 25px/1.0 monospace";
    memo.moveTo(card.x + memoProp.x, card.y + memoProp.y);

    core.currentScene.addChild(memoBack);
    core.currentScene.addChild(memo);
    memoList.backSprite.push(memoBack);
    memoList.sprite.push(memo);
}

// メモのテキストを設定する
//   memo: メモのLabelオブジェクト
//   memoText: 設定するの数値
//   memoList: メモテキストのリスト
export const setMemoText = (memo, memoBack, memoText) => {
    memo.text = memoText;
    memoBack.visible = !!memoText;
}

// メモ用モーダルの決定ボタン押下時にメモにテキストを反映する
//   cardList: 各カードのオブジェクト
//   targetCardIdx: メモの対象となるカードの配列インデックス
export const addMemoExecuteHandler = (cardList, targetCardIdx) => {
    const handlerObj = {
        cardList: cardList,
        targetCardIdx: targetCardIdx,
        handleEvent: () => {
            setMemoText(
                cardList.memo.sprite[targetCardIdx],
                cardList.memo.backSprite[targetCardIdx],
                document.getElementById("memo-input").value
            );
        }
    }
    const memoExecute = document.getElementById("memo-execute");
    memoExecute.addEventListener("click", handlerObj);
    return handlerObj;
}

// メモ用モーダルを閉じた際に決定ボタンに紐付けたEventHandlerを削除する
//   handlerObj: addMemoExecuteHandlerにて紐づけたEventHandlerオブジェクト
export const removeMemoExecuteHandler = (handlerObj) => {
    const memoExecute = document.getElementById("memo-execute");
    const memoModalElem = document.getElementById('memo-modal');
    M.Modal.init(memoModalElem, {
        'onCloseStart': () => {
            memoExecute.removeEventListener("click", handlerObj);
        }
    });
}

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};
