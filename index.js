const express = require('express');

const bugsnag = require('bugsnag');

bugsnag.register('010ac89d903f61c10291a63c2061fc02');

const app = express();
const port = 3000;
const loteria = require('./loteria');

const tempFolder = './tmp';

app.get('/', (req, res) => res.json({ app: 'TNOnline', version: '1.0.0' }));

app.get('/megasena', (req, res) => {
  loteria.megaSena(tempFolder)
    .then((jsonArray) => {
      res.status(200).json(jsonArray);
    });
});

app.get('/megasena/last', (req, res) => {
  loteria.megaSena(tempFolder)
    .then((jsonArray) => {
      res.status(200).json([jsonArray.slice(-1).pop()]);
    });
});

app.get('/megasena/:id', (req, res) => {
  loteria.megaSena(tempFolder)
    .then((jsonArray) => {
      res.status(200).json(jsonArray.filter(item => item.Concurso === parseInt(req.params.id, 10)));
    });
});

app.get('/lotofacil', (req, res) => {
  loteria.lotoFacil(tempFolder)
    .then((jsonArray) => {
      res.status(200).json(jsonArray);
    });
});


app.listen(port, () => {
  console.log('API Loterias ONLINE');
});
