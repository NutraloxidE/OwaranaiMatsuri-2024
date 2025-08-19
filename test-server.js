const express = require('express');
const vhost = require('vhost');
const http = require('http');
const { exec } = require('child_process');

const PORT = 3000; // HTTPポート

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
  res.redirect(`http://localhost:${PORT}` + req.url);
}));

app.use(vhost('www.r1ce.farm', (req, res) => {
  res.redirect(`http://r1ce.farm:${PORT}` + req.url);
}));

/*
 *Routings under here 
*/

app.get('/controls/gitpull', (req, res) => {
  exec('git pull https://github.com/NutraloxidE/OwaranaiMatsuri-2024', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Git pull executed');
});

//
app.use(express.static('wwwroot'));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// HTTPサーバーを作成
http.createServer(app).listen(PORT, () => {
  console.log(`HTTPテストサーバーがポート ${PORT} で実行中です`);
  console.log(`アクセス先:`);
  console.log(`- メインサイト: http://localhost:${PORT}`);
  console.log(`- サブドメインテスト: http://owaranaimatsuri.localhost:${PORT}`);
});
