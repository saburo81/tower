# tower
なんちゃってタワーを遊ぶためのWebアプリ  
カードイメージはForgeからごにょごにょして手に入れた

# 導入手順
1. Node.jsのインストールする（v12で動作確認済）
    https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions-1
1. パッケージのインストール
    `$ npm install`
1. カード画像を`public/images/cards`に配置  
    命名規則は`tower (x).jpg`とする。xは1から始まる連番とする。
1. (任意) `public/images/components`に格納されている下記のトークン画像ファイルを任意の画像に入れ替える
    - 表示される順番は下記の通り
        1. `token_mao.jpg`
        1. `token_shion.jpg`
        1. `token_megu.jpg`
        1. `token_kirara.jpg`
        1. `token_tama.jpg`
        1. `token_kyoro.jpg`
1. コード中の下記変数に対してカード枚数を指定（初期値は200）
    app.js: `towerHeight`
    public/javascripts/main.js: `towerHeight`
1. 起動
    `$ node app.js`
