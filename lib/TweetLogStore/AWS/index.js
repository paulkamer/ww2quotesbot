const aws = require('aws-sdk');
const { logger } = require('../../logger');
const settings = require('../../../config');

/**
 * Class for handling fetching data from the AWS System Manager Parameter Store,
 * and decrypting it with AWS Key Management Service
 */
module.exports = class TweetLogStore {
  /**
   * Fetch the 'tweets log' file from S3.
   *
   * It's used for logging which tweets were sent, so prevent sending the same
   * tweet again too soon.
   */
  async fetchTweetsLog() {
    logger.debug('fetchTweetsLog');

    const s3 = new aws.S3();

    const file = await s3
      .getObject({
        Bucket: settings.aws.tweets_s3_bucket,
        Key: settings.tweets_log_file,
      })
      .promise()
      .catch((e) => {
        logger.error(e);

        return false;
      });

    return this._parseTweetsLogFile(file);
  }

  /**
   * Save the tweets log file to S3
   * @param {Array} logData
   */
  async saveTweetsLog(logData = []) {
    logger.debug('saveTweetsLog');

    const s3 = new aws.S3();

    const file = await s3
      .putObject({
        Bucket: settings.aws.tweets_s3_bucket,
        Key: settings.tweets_log_file,
        Body: JSON.stringify(logData),
      })
      .promise();

    logger.debug({ file });

    return file;
  }

  /**
   * Parse the contents of the tweets log file as JSON.
   *
   * @param {AWS.Request} file
   */
  _parseTweetsLogFile(file) {
    let jsonData = [];

    try {
      jsonData = JSON.parse(file.Body.toString('utf-8') || '[]');
    } catch (e) {
      logger.error('parsing Tweets log as JSON failed', e);
    }

    return jsonData;
  }
};
