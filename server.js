const express = require('express');
const vhost = require('vhost');
const https = require('https'); // httpsモジュールを要求
const fs = require('fs'); // fsモジュールを要求

const PORT = 443; // ポート番号を設定

const app = express();

const subdomainRoutes = {
  'owaranaimatsuri': 'OwaranaiMatsuriRoot_threejs',
  '': 'wwwroot',
};

Object.entries(subdomainRoutes).forEach(([subdomain, rootDirectory]) => {
  const subdomainApp = express();
  subdomainApp.use(express.static(rootDirectory));
  app.use(vhost(`${subdomain}.localhost`, subdomainApp));
  app.use(vhost(`${subdomain}.r1ce.farm`, subdomainApp));
});

app.use(vhost('www.localhost', (req, res) => {
  res.redirect('https://localhost:${PORT}' + req.url); // httpをhttpsに変更
}));

app.use(vhost('www.r1ce.farm', (req, res) => {
  res.redirect('https://r1ce.farm:${PORT}' + req.url); // httpをhttpsに変更
}));

app.use(express.static('wwwroot'));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// SSL証明書を読み込む
let options= {
  key: fs.readFileSync('/etc/letsencrypt/live/r1ce.farm/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/r1ce.farm/fullchain.pem')
};

// コマンドライン引数を取得
var args = process.argv.slice(2);

// テスト環境であった場合、自己証明書に切り替え
if (args.includes('-test')) {
  console.log('テストモードで実行します');
  options= {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
} else {
  console.log('通常モードで実行します');
}

// HTTPSサーバーを作成
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});