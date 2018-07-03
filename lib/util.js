const request = require('request');
const fs = require('fs');
const logger = require('../config/winston');
const path = require('path');
const admZip = require('adm-zip');
const findRemoveSync = require('find-remove');

const Unzip = (fileId, destinationFolder) => {
  const zip = new admZip(fileId);
  zip.extractAllTo(destinationFolder, true);
};

const Download = (arquivo, options, callback) => {
  logger.debug(`... Efetuando o download de: ${arquivo}`);
  const p = new Promise(((resolve, reject) => {
    const {
      pasta,
      nome,
    } = options;

    const id = nome;
    const dest = path.join(pasta, id);

    const dir = path.normalize(pasta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 744);
    }

    const writeStream = fs.createWriteStream(dest);

    // Avisando a promise que acabamos por aqui
    writeStream.on('finish', () => {
      resolve(id);
    });

    // Capturando erros da write stream
    writeStream.on('error', (err) => {
      fs.unlink(dest, reject.bind(null, err));
    });

    const readStream = request.get(arquivo, {
      jar: true,
    });

    // Capturando erros da request stream
    readStream.on('error', (err) => {
      fs.unlink(dest, reject.bind(null, err));
    });

    // Iniciando a transferência de dados
    readStream.pipe(writeStream);
  }));

  // Manter compatibilidade com callbacks
  if (!callback) {
    return p;
  }

  p.then((id) => {
    callback(null, id);
  }).catch((err) => {
    callback(err);
  });
};

/**
 * Faz o download dos resultados da loteria desejada
 * @param {string} folder Diretório temporario
 * @param {string} url exemplo: 'http://www1.caixa.gov.br/loterias/_arquivos/loterias/D_megase.zip'
 * @param {string} loteria exemplo: megasena
 * @param {string} arquivoComResultados exemplo: 'D_MEGA.HTM'
 */
exports.downloadResultados = function (folder, url, loteria, arquivoComResultados) {
  return new Promise(((resolve, reject) => {
    const options = {
      pasta: folder,
      nome: `${loteria}.zip`,
      destino: path.join(folder, loteria),
    };

    findRemoveSync(options.pasta, { dir: '*', age: { seconds: 60 * 60 * 4 } });

    if (fs.existsSync(options.destino)) {
      logger.debug(`... Aquivo existente: ${options.destino}`);
      resolve(path.join(options.destino, arquivoComResultados));
    } else {
      Download(url, options)
        .then((fileId) => {
          Unzip(path.join(folder, fileId), options.destino);
          const nomeArquivoHTMLResultados = path.join(options.destino, arquivoComResultados);
          resolve(nomeArquivoHTMLResultados);
        }).catch((err) => {
          logger.debug(`Erro ao realizar o download ou extração do zip da loteria ${loteria}`, err);
          reject(err);
        });
    }
  }));
};

/**
 * Converte o texto do html da caixa para numero com decimais
 * @param {string} value valor string a ser convertido
 */
exports.parseToFloat = (value) => {
  if (value) {
    value.replace(/\./g, '');
    value.replace(/,/g, '.');
  }
  return isNaN(parseFloat(value)) ? value : parseFloat(value);
};

/**
 * Converte o texto do html da caixa para numero com decimais
 * @param {string} value valor string a ser convertido
 */
exports.parseToInt = (value) => {
  if (value) {
    value.replace(/\./g, '');
    value.replace(/,/g, '.');
  }
  return isNaN(parseInt(value, 10)) ? value : parseInt(value, 10);
};
