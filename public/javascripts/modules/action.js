/* カード操作に関する関数 */

// cardNumのカードを手札に追加する
export const putCardInHand = (cardNum, core, cardProperties, handList, handListNum, handNumElem, touchFuncHand) => {
    const handProp = cardProperties.hand
    const card = new Sprite(handProp.image.width, handProp.image.height);
    const cardName = cardProperties.imagePath.card + 'tower (' + cardNum + ').jpg';

    // カード画像生成
    card.image = core.assets[cardName];
    card.scaleX = handProp.image.scale;
    card.scaleY = handProp.image.scale;

    // カード画像位置指定
    card.moveTo(
        handProp.field.x + handList.length * Math.ceil(handProp.image.width * handProp.image.scale),
        handProp.field.y
    );

    // カードクリック時動作設定
    card.ontouchstart = touchFuncHand;

    // カード描画
    core.currentScene.addChild(card);

    // 手札情報の更新
    handList.push(card);
    handListNum.push(cardNum);
    setHandCardNum(handNumElem._element, handList.length);
}

// 一番右の土地を破壊する
export const destroyLand = (core, landList) => {
    // カード描画
    const targetLand = landList[landList.length - 1];
    core.currentScene.removeChild(targetLand);

    // 土地情報の更新
    landList.pop();
}

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};
