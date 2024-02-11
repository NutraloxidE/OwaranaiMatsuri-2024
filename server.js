const express = require('express');
const vhost = require('vhost');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process'); // 追加

const PORT = 443;

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
  res.redirect('https://localhost:${PORT}' + req.url);
}));

app.use(vhost('www.r1ce.farm', (req, res) => {
  res.redirect('https://r1ce.farm:${PORT}' + req.url);
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

let options = {};

var args = process.argv.slice(2);

if (args.includes('-test')) {
  console.log('テストモードで実行します');
  options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
} else {
  console.log('通常モードで実行します');
  options = {
    key: fs.readFileSync('/etc/letsencrypt/live/r1ce.farm/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/r1ce.farm/fullchain.pem')
  };
}

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
