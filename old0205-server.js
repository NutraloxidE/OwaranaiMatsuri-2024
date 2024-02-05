const express = require('express');
const vhost = require('vhost'); // ワイルドカードサブドメインをサポートするために使用できるパッケージ

const app = express();

// サブドメインごとのルートディレクトリのマッピング
const subdomainRoutes = {
  'owaranaimatsuri': 'OwaranaiMatsuriRoot_threejs',
  'www': 'wwwroot',
  '': 'wwwroot',
  // 他のサブドメインも追加
};

// サブドメインごとにルーティングを設定
Object.entries(subdomainRoutes).forEach(([subdomain, rootDirectory]) => {
  const subdomainApp = express();

  // サブドメインごとのルートディレクトリに静的コンテンツを提供
  subdomainApp.use(express.static(rootDirectory));

  // 他のルーティングやミドルウェアもここに追加可能

  // サブドメインごとのアプリをメインアプリに組み込み
  app.use(vhost(`${subdomain}.localhost`, subdomainApp));
  app.use(vhost(`${subdomain}.r1ce.farm`, subdomainApp));

});

app.use(vhost('localhost', express.static('wwwroot')));
app.use(vhost('r1ce.farm', express.static('wwwroot')));

// その他の共通のルートやミドルウェアを設定
// ...

// メインアプリを指定のポートで起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});