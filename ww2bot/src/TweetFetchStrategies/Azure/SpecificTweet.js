const { logger } = require('../../../../lib/logger');

/**
 * Strategy to fetch a specific tweet by it's id.
 */
class SpecificTweet {
  constructor(tweetId, tweetFetcher) {
    this.tweetId = tweetId;
    this.tweetFetcher = tweetFetcher;
  }

  /**
   * Fetch a specific tweet.
   */
  async fetchTweet() {
    logger.debug('SpecificTweet.fetchTweet');

    const result = await this.tweetFetcher.fetchTweetById(this.tweetId, {});

    return result[0];
  }
}

module.exports = SpecificTweet;
