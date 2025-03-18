// const i18next = require('i18next');
// const FsBackend = require('i18next-node-fs-backend');
// const middleware = require('i18next-express-middleware');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// app.get('/editor', function(req, res) {
//   res.sendFile(__dirname + '/debugEditor.html');
// });

// app.get('/locizify.js', function(req, res) {
//   fs.readFile(__dirname + '/../../locizify/locizify.js', 'utf-8', function(err, doc) {
//     res.send(doc);
//   });
// });

app.get('/locize.js', (req, res) => {
  fs.readFile(`${__dirname}/../../locize.js`, 'utf-8', (err, doc) => {
    res.send(doc);
  });
});

// in your request handler
// app.get('myRoute', function(req, res) {
//   var lng = req.language; // 'de-CH'
//   var lngs = req.languages; // ['de-CH', 'de', 'en']
//   req.i18n.changeLanguage('en'); // will not load that!!! assert it was preloaded
//
//   var exists = req.i18n.exists('myKey');
//   var translation = req.t('myKey');
// });

app.listen(8088);
console.log('http://localhost:8088')
