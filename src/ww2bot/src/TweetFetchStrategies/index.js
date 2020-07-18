const S3SqlHandler = require('../S3/S3SqlHandler');

const strategies = {
  random: require('./RandomTweet'),
  specificTweet: require('./SpecificTweet'),
};

module.exports = {
  ...strategies,

  /**
   * Factory
   */
  buildFetchStrategy(tweetId = null) {
    if (tweetId && tweetId > 0) {
      return new strategies.specificTweet(tweetId, new S3SqlHandler());
    }

    return new strategies.random(new S3SqlHandler());
  },
};
