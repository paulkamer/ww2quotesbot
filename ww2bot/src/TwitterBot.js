const { logger } = require('../../lib/logger');

const TweetLogger = require('./TweetLogger');
const TweetFetcher = require('./TweetFetcher');
const TweetSender = require('./TweetSender');
const RetweetScheduler = require('./RetweetScheduler');

module.exports = class TwitterBot {
  /**
   * Publish a new tweet
   *
   * @param {Sting|Number} tweetId ID of a specific tweet to send. Otherwise a random one is picked
   */
  async publishTweet(tweetId = null) {
    await this.fetchTwitterCredentials();

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

    await this.logTweet(tweet.id);

    await this.scheduleRetweet(sendResult);

    return tweet;
  }

  /**
   * Publish the tweet to Twitter.
   */
  async sendTweet(tweet) {
    return await new TweetSender(tweet, this.twitterCredentials).send();
  }

  async logTweet(tweetId) {
    await TweetLogger.createInstance().logTweet(tweetId);
  }

  /**
   * schedule re-tweet after several hours
   */
  async scheduleRetweet(sendResult) {
    const id = sendResult.id_str;

    return await new RetweetScheduler(id).schedule();
  }

  /**
   * Fetch the Twitter credentials from the secrets store.
   */
  async fetchTwitterCredentials() {
    const platform = process.env.PLATFORM.toLowerCase();

    var credentialsStore =
      platform == 'aws'
        ? require('../../lib/CredentialsStore/AWS')
        : require('../../lib/CredentialsStore/Azure');

    this.twitterCredentials = await new credentialsStore().fetchParameter({
      parameterName: process.env.TWITTER_CRED_PARAM_NAME,
    });
  }
};
