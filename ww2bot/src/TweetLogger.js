const settings = require('../../config');
const { logger } = require('../../lib/logger');

/**
 * Log tweets that were sent to a log file.
 * Also supports fetching all logged tweet IDs.
 */
module.exports = class TweetLogger {
  constructor(tweetLogStore) {
    this.tweetLogStore = tweetLogStore;
  }

  static createInstance() {
    const tweetLogStore =
      process.env['PLATFORM'] == 'AWS'
        ? require('../../lib/TweetLogStore/AWS')
        : require('../../lib/TweetLogStore/Azure');

    return new TweetLogger(new tweetLogStore());
  }

  /**
   * Log the ID of the tweet to the tweets log file.
   * Log size/length is kept in check
   *
   * @param {Number} tweetId
   *
   * @returns Void
   */
  async logTweet(tweetId) {
    const log = await this.tweetLogStore.fetchTweetsLog();

    log.push({ id: tweetId, time: Date.now() });

    if (log.length >= settings.max_tweet_log_length) log.shift();

    await this.tweetLogStore.saveTweetsLog(log);
  }

  /**
   * Fetch a (unique) list of logged tweet IDs.
   */
  async fetchLoggedTweetIds() {
    logger.debug('fetchLoggedTweetIds');

    // Fetch tweets.log
    const loggedTweets = await this.tweetLogStore.fetchTweetsLog();

    const blacklistedIds = loggedTweets.map((log_entry) => log_entry.id);

    return [...new Set(blacklistedIds)]; // Ensure the list is unique
  }
};
