const Twitter = require('twitter-lite');

const { logger } = require('../../lib/logger');
const credentialsStore = require('../../lib/CredentialsStore');
const TweetStatusFormatter = require('./TweetStatusFormatter');

module.exports = class TweetSender {
  constructor(tweet) {
    this.tweet = tweet;
  }

  /**
   * Init the Twitter SDK client with credentials provided by the credentialsStore.
   */
  async initTwitter() {
    const twitterCredentials = await new credentialsStore().fetchParameter({
      parameterName: process.env.SSM_PARAMETER_NAME,
    });

    this.twitter = new Twitter(twitterCredentials);
  }

  /**
   * Send the actual tweet by posting a status update.
   */
  async send() {
    logger.debug('TweetSender.send', this.tweet);

    if (process.env.DRY_RUN) {
      logger.debug('[DRY_RUN] Skipping sending tweet');
      return false;
    }

    await this.initTwitter();

    // Format the tweet (called 'status' in Twitter terms)
    const status = new TweetStatusFormatter(
      this.tweet
    ).formatTweetStatusString();

    const postResult = await this.twitter
      .post('statuses/update', {
        status,
      })
      .catch((error) => {
        logger.error(error);
        return false;
      });

    logger.debug('tweet result', postResult);

    return postResult;
  }
};
