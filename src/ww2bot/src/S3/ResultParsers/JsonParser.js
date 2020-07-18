const { logger } = require('../../../../lib/logger');

/**
 * Helper class to parse a string as JSON.
 */
module.exports = class JsonParser {
  /**
   *
   * @param {String} rawData stringified JSON
   */
  constructor(rawData) {
    this.rawData = (rawData || '').trim();
  }

  /**
   * Parse the rawData string as JSON.
   *
   * @returns JSON | false
   */
  parse() {
    try {
      return JSON.parse(this.rawData);
    } catch (e) {
      logger.error('JsonParser.parse error', e);
      return false;
    }
  }
};
