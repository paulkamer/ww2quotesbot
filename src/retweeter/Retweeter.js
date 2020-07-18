const Twitter = require('twitter-lite');

const credentialsStore = require('../lib/CredentialsStore');

module.exports = class Retweeter {
  constructor(tweetId) {
    this.tweetId = tweetId;
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
   * Send the actual retweet
   */
  async retweet() {
    console.debug('Retweeter.retweet', this.tweetId);

    if (process.env.DRY_RUN) {
      console.debug('[DRY_RUN] Skipping sending retweet');
      return false;
    }

    await this.initTwitter();

    const postResult = await this.twitter
      .post(`statuses/retweet/${this.tweetId}`)
      .catch((error) => {
        console.error(error);
        return false;
      });

    console.debug('retweet result', postResult);

    return true;
  }
};
