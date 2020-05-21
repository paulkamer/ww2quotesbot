const { logger } = require('./lib/logger');

const TweetLogger = require('./TweetLogger');
const TweetFetcher = require('./TweetFetcher');
const TweetSender = require('./TweetSender');

module.exports = class TwitterBot {
  /**
   * Publish a new tweet
   *
   * @param {Sting|Numer} tweetId ID of a specific tweet to send. Otherwise a random one is picked
   */
  async publishTweet(tweetId = null) {
    const tweetLogger = new TweetLogger();

    // Fetch a tweet to publish
    const tweet = await new TweetFetcher(tweetId).fetchTweet();

    if (!tweet) {
      logger.error('Could not find a tweet to send');
      return false;
    }

    // Publish the tweet on Twitter
    const sendResult = await this.sendTweet(tweet);

    if (!sendResult) {
      logger.error('Sending tweet failed.');
      return false;
    }

    await tweetLogger.logTweet(tweet.id);

    // TODO: phase II - schedule re-tweet after 8-12 hours

    return tweet;
  }

  /**
   * Publish the tweet to Twitter.
   */
  async sendTweet(tweet) {
    return await new TweetSender(tweet).send();
  }
};
