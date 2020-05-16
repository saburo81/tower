# tower
なんちゃってタワーを遊ぶためのWebアプリ  
カードイメージはForgeからごにょごにょして手に入れた

# 導入手順
1. Node.jsのインストールする（v12で動作確認済）
    https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions-1
2. パッケージのインストール
    `$ npm install`
3. カード画像を`public/images/cards`に配置  
    命名規則は`tower (x).jpg`とする。xは1から始まる連番とする。
4. コード中の下記変数に対してカード枚数を指定（初期値は200）
    app.js: `towerHeight`
    public/javascripts/main.js: `towerHeight`
5. 起動
    `$ node app.js`
