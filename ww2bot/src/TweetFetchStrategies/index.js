const AwsTweetFetcher = require('../TweetFetcher/AWS/TweetFetcher');
const AzureTweetFetcher = require('../TweetFetcher/Azure/TweetFetcher');

const strategies = {
  aws: {
    random: require('./AWS/RandomTweet'),
    specificTweet: require('./AWS/SpecificTweet'),
  },
  azure: {
    random: require('./Azure/RandomTweet'),
    specificTweet: require('./Azure/SpecificTweet'),
  },
};

module.exports = {
  ...strategies,

  /**
   * Factory
   */
  buildFetchStrategy(tweetId = null) {
    const platform = process.env.PLATFORM.toLowerCase();

    var tweetFetcher =
      platform == 'aws' ? new AwsTweetFetcher() : new AzureTweetFetcher();

    if (tweetId && tweetId > 0) {
      return new strategies[platform].specificTweet(tweetId, tweetFetcher);
    }

    return new strategies[platform].random(tweetFetcher);
  },
};
