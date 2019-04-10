const apicache = require('apicache');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');

require('dotenv').config();

const bugsnag = require('./config/bugsnag');
const logger = require('./config/winston');
const loteria = require('./loteria');

const app = express();
const port = process.env.PORT || 3000;
const tempFolder = './tmp';
const version = '1.0.1;';
const cache = apicache.middleware;

app.use(compression());
app.use(helmet());
app.use(bugsnag.requestHandler);

app.get('/', (req, res) => res.json({ app: 'APILoteria', version }));

app.get('/megasena', (req, res) => {
  console.log('Sending internal request to backend...');
  loteria.megaSena(tempFolder)
    .then((jsonArray) => {
      res.status(200).json(jsonArray);
    });
});

app.get('/megasena/last', cache('5 minutes'), (req, res) => {
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
  logger.info(`API Loteria listening on port ${port}`);
});
