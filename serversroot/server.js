const express = require('express');
const vhost = require('vhost'); // ワイルドカードサブドメインをサポートするために使用できるパッケージ

const app = express();

// サブドメインごとのルートディレクトリのマッピング
const subdomainRoutes = {
  'owaranaimatsuri': 'OwaranaiMatsuriRoot_threejs',
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

// wwwでアクセスがあった場合のリダイレクト
app.use(vhost('www.localhost', (req, res) => {
  res.redirect('http://localhost:3000' + req.url);
}));

app.use(vhost('www.r1ce.farm', (req, res) => {
  res.redirect('http://r1ce.farm:3000' + req.url);
}));

// IPアドレスで直接アクセスした場合にwwwrootディレクトリを提供
app.use(express.static('wwwroot'));

// すべてのルート定義の後に配置
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// メインアプリを指定のポートで起動
const PORT = 443;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});