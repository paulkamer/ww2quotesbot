const { buildFetchStrategy } = require('./TweetFetchStrategies');

/**
 * Class to fetch a tweet
 * Delegates implementation to one of the strategies (specific or random tweet selection).
 */
module.exports = class TweetFetcher {
  constructor(tweetId = null) {
    this.fetchStrategy = buildFetchStrategy(tweetId);
  }

  async fetchTweet() {
    return await this.fetchStrategy.fetchTweet();
  }
};
