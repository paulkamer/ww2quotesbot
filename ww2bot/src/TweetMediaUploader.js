const Twitter = require('twitter-lite');
const https = require('https');

const { logger } = require('../../lib/logger');
const settings = require('../../config');

module.exports = class TweetMediaUploader {
  constructor(tweet, twitterCredentials) {
    this.tweet = tweet;
    this.twitterCredentials = twitterCredentials;
  }

  /**
   * Init the Twitter SDK client with credentials provided by the credentialsStore.
   */
  async initTwitterClient() {
    this.twitterUploadClient = new Twitter({
      ...this.twitterCredentials,
      subdomain: 'upload',
    });
  }

  async uploadMedia() {
    logger.debug('TweetMediaUploader.uploadMedia - NOT IMPLEMENTED YET');

    return Promise.resolve([]);

    // const urls = settings.mediaUrlFields
    //   .map((urlField) => this.tweet[urlField])
    //   .filter(Boolean); // Filter out 'undefined' or empty strings

    // if (urls.length === 0) {
    //   logger.debug('TweetMediaUploader.uploadMedia - tweet has no media_url');

    //   return Promise.resolve([]);
    // }

    // await this.initTwitterClient();

    // return urls.map((url) => this.uploadImage(url));
  }

  /**
   * Upload an image to Twitter.
   *
   * @param {string} url URL to fetch the image from (Amazon S3).
   * @return {Promise<string>} Promise that returns the media_id of the uploaded image.
   */
  uploadImage(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        const data = [];

        res
          .on('data', (chunk) => {
            data.push(chunk);
          })
          .on('end', () => {
            let buffer = Buffer.concat(data);

            // Upload image to Twitter as Media upload. It's necessary to convert it to a Base-64 enconded string,
            // otherwise we get a "Could not authenticate you." error.
            this.twitterUploadClient
              .post('media/upload', {
                media_data: buffer.toString('base64'),
              })
              .then((result) => {
                resolve(result.media_id_string);
              });
          });
      });

      req.on('error', (err) => {
        logger.error('TweetMediaUploader error:', err);

        reject();
      });

      req.end();
    });
  }
};
