const path = require('path');
const lotoFacil = require('./lib/loto-facil');
const megaSena = require('./lib/mega-sena');

exports.megaSena = tempDirectory => megaSena.downloadResults(path.normalize(tempDirectory))
  .then(nomeArquivoComResultados => megaSena.htmlToJson(nomeArquivoComResultados));

exports.lotoFacil = tempDirectory => lotoFacil.downloadResults(path.normalize(tempDirectory))
  .then(nomeArquivoComResultados => lotoFacil.htmlToJson(nomeArquivoComResultados));
