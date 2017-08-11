/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T09:42:43+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-11T14:49:55+10:00
 */

import { Doc } from 'codemirror';

export default class StaticApi {
  /**
   * Determine EOL to be used for given content string
   *
   * @param {string} content - content
   * @return {string} EOL
   */
  static determineEol(content) {
    if (!content || content === '') return global.EOL;

    const eols = content.match(/(?:\r?\n)/g) || [];

    if (eols.length === 0) return global.EOL;

    const crlfCount = eols.filter(eol => eol === '\r\n').length;
    const lfCount = eols.length - crlfCount;

    // majority wins and slightly favour \n
    return lfCount >= crlfCount ? '\n' : '\r\n';
  }

  static createNewDocumentObject(content = '') {
    return new Doc(content, 'MongoScript');
  }

  static parseShellJson(jsonStr, success, error) {
    const ParseWorker = require('worker-loader!./workers/jsonParse.js'); // eslint-disable-line
    const parseWorker = new ParseWorker();
    parseWorker.postMessage({ 'cmd': 'start', 'jsonStr': jsonStr });
    parseWorker.addEventListener('message', (e) => {
      if (e.data[1]) {
        error(e.data[1]);
      } else {
        success(e.data[0]);
      }
    });
  }
}
