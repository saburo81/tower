/* カード操作に関する関数 */

// カードを配置する
//   cardNum: カード番号
//   dstCardList: 配置する場のカードリスト
//   dstCardProp: 配置する場のカードプロパティ
//   imagePath: カード画像ディレクトリへのパス
//   core: EnchantJSオブジェクト
//   touchFunc: カードクリック時に呼び出す関数
export const setCard = (cardNum, dstCardList, dstCardProp, imagePath, core,
                        touchFunc) => {
    // カードを生成
    const isLand = cardNum === 10000;
    const card = new Sprite(dstCardProp.image.width, dstCardProp.image.height);
    const cardName = isLand ? `${imagePath}tower_land.jpg` : `${imagePath}tower (${cardNum}).jpg`;
    card.image = core.assets[cardName];
    card.scaleX = dstCardProp.image.scale;
    card.scaleY = dstCardProp.image.scale;
    card.moveTo(
        dstCardProp.field.x + dstCardList.sprite.length * Math.ceil(dstCardProp.image.width * dstCardProp.image.scale),
        dstCardProp.field.y
    );
    card.ontouchstart = touchFunc;
    core.currentScene.addChild(card);

    // 手札情報の更新
    dstCardList.sprite.push(card);
    if (!isLand) {
        dstCardList.number.push(cardNum);
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
    const discardNum = targetCardList.sprite.findIndex((card) => card.x === targetCard.x);
    const discardSet = targetCardList.sprite[discardNum];
    core.currentScene.removeChild(discardSet);
    for (let j = discardNum + 1; j < targetCardList.sprite.length; ++j) {
        const moveCard = targetCardList.sprite[j];
        moveCard.moveTo(
            moveCard.x - Math.ceil(targetCardProp.image.width * targetCardProp.image.scale),
            targetCardProp.field.y
        );
        targetCardList.sprite[j - 1] = targetCardList.sprite[j];
        targetCardList.number[j - 1] = targetCardList.number[j];
    };
    targetCardList.sprite.pop();
    targetCardList.number.pop();
    touchRemoveFunc();
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
//   counter: カウンターの数値
//   counterList: カウンターのリスト
export const setCounter = (counter, counterList) => {
    // カードを生成
    const counterLabel = new Label(String(counter));
    counterList.sprite.push(counterLabel);
    counterList.number.push(counter);
}

// カウンターを取り除く
//   counterLabel: カウンターのLabelオブジェクト
//   counterList: カウンターのリスト
//   core: EnchantJSオブジェクト
export const removeCounter = (counterLabel, counterList, core) => {
    const counterIdx = counterList.sprite.findIndex((label) => label === counterLabel);
    core.rootScene.removeChild(counterLabel);
    for (let i = counterList.sprite.length - 1; i > counterIdx; i--) {
        const rightLabel = counterList.sprite[i];
        const leftLabel = counterList.sprite[i - 1];
        rightLabel.moveTo(leftLabel.x, leftLabel.y);
    };
    counterList.sprite.splice(counterIdx, 1);
    counterList.number.splice(counterIdx, 1);
}

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};
