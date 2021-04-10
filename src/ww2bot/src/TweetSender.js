const Twitter = require('twitter-lite');

const { logger } = require('../../lib/logger');
const credentialsStore = require('../../lib/CredentialsStore');
const TweetStatusFormatter = require('./TweetStatusFormatter');
const TweetMediaUploader = require('./TweetMediaUploader');

module.exports = class TweetSender {
  constructor(tweet) {
    this.tweet = tweet;
  }

  /**
   * Init the Twitter SDK client with credentials provided by the credentialsStore.
   */
  async initTwitterClient() {
    const twitterCredentials = await new credentialsStore().fetchParameter({
      parameterName: process.env.SSM_PARAMETER_NAME,
    });

    this.twitter = new Twitter(twitterCredentials);
  }

  /**
   *
   */
  async send() {
    logger.debug('TweetSender.send', this.tweet);

    if (process.env.DRY_RUN) {
      logger.debug('[DRY_RUN] Skipping sending tweet');
      return false;
    }

    await this.initTwitterClient();

    // Format the tweet (called 'status' in Twitter terms).
    const status = new TweetStatusFormatter(
      this.tweet
    ).formatTweetStatusString();

    try {
      // Upload images.
      const promises = await new TweetMediaUploader(this.tweet).uploadMedia();

      // Post status update once all images are uploaded.
      return Promise.all(promises).then(async (mediaIds) => {
        return await this.postStatusUpdate(status, mediaIds);
      });
    } catch (e) {
      logger.debug('DEBUG', e);

      return Promise.resolve(false);
    }
  }

  /**
   * Send the actual tweet by posting a status update.
   */
  async postStatusUpdate(status, mediaIds = []) {
    logger.debug('postStatusUpdate', { mediaIds });

    const body = { status };
    if (mediaIds.length > 0) body.media_ids = mediaIds.join(',');

    return await this.twitter.post('statuses/update', body).catch((error) => {
      logger.error(error);
      return false;
    });
  }
};
