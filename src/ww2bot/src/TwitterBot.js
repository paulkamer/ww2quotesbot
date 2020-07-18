const { logger } = require('../../lib/logger');

const TweetLogger = require('./TweetLogger');
const TweetFetcher = require('./TweetFetcher');
const TweetSender = require('./TweetSender');
const RetweetScheduler = require('./RetweetScheduler');

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

    await this.scheduleRetweet(sendResult);

    return tweet;
  }

  /**
   * Publish the tweet to Twitter.
   */
  async sendTweet(tweet) {
    return await new TweetSender(tweet).send();
  }

  /**
   * schedule re-tweet after 8-12 hours
   */
  async scheduleRetweet(sendResult) {
    const id = sendResult.id_str;

    return await new RetweetScheduler(id).schedule();
  }
};
