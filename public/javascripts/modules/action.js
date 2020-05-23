/* カード操作に関する関数 */

// cardNumのカードを手札に追加する
export const putCardInHand = (cardNum, core, cardProperties, cardList, handNumElem, touchFuncHand) => {
    const handProp = cardProperties.hand;
    const handList = cardList.hand;
    const card = new Sprite(handProp.image.width, handProp.image.height);
    const cardName = cardProperties.imagePath.card + 'tower (' + cardNum + ').jpg';

    // カード画像生成
    card.image = core.assets[cardName];
    card.scaleX = handProp.image.scale;
    card.scaleY = handProp.image.scale;

    // カード画像位置指定
    card.moveTo(
        handProp.field.x + handList.sprite.length * Math.ceil(handProp.image.width * handProp.image.scale),
        handProp.field.y
    );

    // カードクリック時動作設定
    card.ontouchstart = touchFuncHand;

    // カード描画
    core.currentScene.addChild(card);

    // 手札情報の更新
    handList.sprite.push(card);
    handList.number.push(cardNum);
    setHandCardNum(handNumElem._element, handList.sprite.length);
}

// 一番右の土地を破壊する
export const destroyLand = (core, landList) => {
    // カード描画
    const targetLand = landList[landList.length - 1];
    core.currentScene.removeChild(targetLand);

    // 土地情報の更新
    landList.pop();
}

// カードをplayFieldに配置する
export const playCard = (targetCard, core, socket, cardProperties,
                                    cardList, touchFuncPlay) => {
    const playProp = cardProperties.play;

    // playFieldのカードSprite生成
    const discardNum = cardList.hand.sprite.findIndex((card) => card.x === targetCard.x);
    const play_card_Num = cardList.hand.number[discardNum];
    const play_card = new Sprite(playProp.image.width, playProp.image.height);
    const play_card_name = cardProperties.imagePath.card + 'tower (' + play_card_Num + ').jpg';
    play_card.image = core.assets[play_card_name];
    play_card.scaleX = playProp.image.scale;
    play_card.scaleY = playProp.image.scale;
    play_card.moveTo(
        playProp.field.x + cardList.field.sprite.length * Math.ceil(playProp.image.width * playProp.image.scale),
        playProp.field.y
    );
    play_card.ontouchstart = touchFuncPlay;
    core.rootScene.addChild(play_card);
    cardList.field.sprite.push(play_card);
    cardList.field.number.push(play_card_Num);
    const counter_label = new Label('0');
    cardList.counter.sprite.push(0);
    cardList.counter.number.push(counter_label);

    // プレイしたカード情報をsocketで通知
    socket.emit('play', play_card_Num);
}

// 土地をセットする
export const setLand = (core, cardProperties, cardList,
                            touchFuncLand) => {
    // 土地カード生成
    const landProp = cardProperties.land;
    const towerLand = new Sprite(landProp.image.width, landProp.image.height);
    towerLand.image = core.assets[cardProperties.imagePath.component + 'tower_land.jpg'];
    towerLand.scaleX = landProp.image.scale;
    towerLand.scaleY = landProp.image.scale;
    towerLand.moveTo(
        landProp.field.x + cardList.land.sprite.length * Math.ceil(landProp.image.width * landProp.image.scale),
        landProp.field.y
    );
    towerLand.ontouchstart = touchFuncLand;
    core.rootScene.addChild(towerLand);
    cardList.land.sprite.push(towerLand);
}

// 指定されたカードを取り除く
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

// 手札枚数表示の更新
var setHandCardNum = function (element, handNum) {
    element.innerText = handNum + '枚';
};
