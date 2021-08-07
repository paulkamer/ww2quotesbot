const Twitter = require('twitter-lite');

const { logger } = require('../../lib/logger');
const TweetStatusFormatter = require('./TweetStatusFormatter');
const TweetMediaUploader = require('./TweetMediaUploader');

module.exports = class TweetSender {
  constructor(tweet, twitterCredentials) {
    this.tweet = tweet;
    this.twitterCredentials = twitterCredentials;
  }

  /**
   * Init the Twitter SDK client with credentials provided by the credentialsStore.
   */
  async initTwitterClient() {
    this.twitter = new Twitter(this.twitterCredentials);
  }

  /**
   * Send tweet
   */
  async send() {
    logger.debug('TweetSender.send', this.tweet);

    if (process.env.DRY_RUN == 'true') {
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
      const promises = await new TweetMediaUploader(
        this.tweet,
        this.twitterCredentials
      ).uploadMedia();

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
