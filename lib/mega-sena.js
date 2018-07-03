const cheerio = require('cheerio');
const fs = require('fs');
const logger = require('../config/winston');
const path = require('path');
const util = require('./util');

exports.downloadResults = (folder) => {
  const url = 'http://www1.caixa.gov.br/loterias/_arquivos/loterias/D_megase.zip';
  return util.downloadResultados(folder, url, 'D_megase', 'D_MEGA.HTM');
};

exports.htmlToJson = (htmlFile) => {
  const destiny = path.join(htmlFile, '..', 'result.json');

  if (fs.existsSync(destiny)) {
    logger.debug(`... Aquivo JSON: ${destiny}`);

    return JSON.parse(fs.readFileSync(destiny, 'utf8'));
  }

  //  Informa que irá processar o arquivo e o caminho dele
  logger.debug('... Convertendo arquivo HTML em JSON. Arquivo:', htmlFile);

  // Cria a Promise
  return new Promise(((resolve, reject) => {
    // Processa o arquivo
    fs.readFile(htmlFile, 'latin1', (err, html) => {
      if (err) {
        logger.debug(err);
        reject(err);
        return;
      }

      const $ = cheerio.load(html);

      /**
       * Obtém do objeto html o texto (do cheerio)
       * @param {string} value valor string a ser convertido
       */
      function getText(element) {
        if (element && $(element).text()) {
          return $(element).text().trim();
        }

        return undefined;
      }

      const trs = $('tr');
      const totalCount = trs.length - 1;
      let qtdProcessada = 0;
      let qtdErros = 0;

      const resultados = [];

      trs.each(function (index) {
        qtdProcessada += 1;

        const tds = $(this).find('td[rowspan]');
        if (tds && tds.length > 0) {
          const sorteio = {};
          sorteio.Concurso = util.parseToInt(getText(tds[0]));
          sorteio.DataSorteio = getText(tds[1]);
          sorteio.Dezena1 = util.parseToInt(getText(tds[2]));
          sorteio.Dezena2 = util.parseToInt(getText(tds[3]));
          sorteio.Dezena4 = util.parseToInt(getText(tds[5]));
          sorteio.Dezena5 = util.parseToInt(getText(tds[6]));
          sorteio.Dezena3 = util.parseToInt(getText(tds[4]));
          sorteio.Dezena6 = util.parseToInt(getText(tds[7]));
          sorteio.Arrecadacao_Total = util.parseToFloat(getText(tds[8]));
          sorteio.Ganhadores_Sena = util.parseToInt(getText(tds[9]));
          sorteio.Cidade = getText(tds[10]);
          sorteio.UF = getText(tds[11]);
          sorteio.Rateio_Sena = util.parseToFloat(getText(tds[12]));
          sorteio.Ganhadores_Quina = util.parseToInt(getText(tds[13]));
          sorteio.Rateio_Quina = util.parseToFloat(getText(tds[14]));
          sorteio.Ganhadores_Quadra = util.parseToInt(getText(tds[15]));
          sorteio.Rateio_Quadra = util.parseToFloat(getText(tds[16]));
          sorteio.Acumulado = util.parseToFloat(getText(tds[17]));
          sorteio.Valor_Acumulado = util.parseToFloat(getText(tds[18]));
          sorteio.Estimativa_Prêmio = util.parseToFloat(getText(tds[19]));
          sorteio.Acumulado_Mega_da_Virada = util.parseToFloat(getText(tds[20]));


          resultados.push(sorteio);
        } else {
          qtdErros += 1;
        }

        if (totalCount === index) {
          logger.debug('Processo concluído', '| Processados= ', qtdProcessada, ` | Erros=${qtdErros}`);
          resolve(resultados);

          fs.writeFile(destiny, JSON.stringify(resultados), 'utf8', (err) => {
            if (err) logger.debug(err);
          });
        }
      });
    });
  }));
};
