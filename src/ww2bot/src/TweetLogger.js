const aws = require('aws-sdk');

const settings = require('../../config');
const { logger } = require('../../lib/logger');

/**
 * Log tweets that were sent to a log file.
 * Also supports fetching all logged tweet IDs.
 */
module.exports = class TweetLogger {
  /**
   * Log the ID of the tweet to the tweets log file.
   * Log size/length is kept in check
   *
   * @param {Number} tweetId
   *
   * @returns Void
   */
  async logTweet(tweetId) {
    const log = await this.fetchTweetsLog();

    log.push({ id: tweetId, time: Date.now() });

    if (log.length >= settings.max_tweet_log_length) log.shift();

    await this.saveTweetsLog(log);
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
        Bucket: settings.tweets_s3_bucket,
        Key: settings.tweets_log_file,
        Body: JSON.stringify(logData),
      })
      .promise();

    logger.debug({ file });

    return file;
  }

  /**
   * Fetch a (unique) list of logged tweet IDs.
   */
  async fetchLoggedTweetIds() {
    logger.debug('fetchLoggedTweetIds');

    // Fetch tweets.log
    const loggedTweets = await this.fetchTweetsLog();

    const blacklistedIds = loggedTweets.map((log_entry) => log_entry.id);

    return [...new Set(blacklistedIds)]; // Ensure the list is unique
  }

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
        Bucket: settings.tweets_s3_bucket,
        Key: settings.tweets_log_file,
      })
      .promise()
      .catch((e) => {
        logger.error(e);

        return false;
      });

    return this.parseTweetsLogFile(file);
  }

  /**
   * Parse the contents of the tweets log file as JSON.
   *
   * @param {AWS.Request} file
   */
  parseTweetsLogFile(file) {
    let jsonData = [];

    try {
      jsonData = JSON.parse(file.Body.toString('utf-8') || '[]');
    } catch (e) {
      logger.error('parsing Tweets log as JSON failed', e);
    }

    return jsonData;
  }
};
