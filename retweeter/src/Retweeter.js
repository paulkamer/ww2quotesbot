const Twitter = require('twitter-lite');

const RetweetQueue = require('../../lib/RetweetQueue');

module.exports = class Retweeter {
  /**
   * Send the actual retweet
   */
  async retweetLatestFromQueue() {
    console.log('Retweeter.retweetLatestFromQueue');

    const retweetQueue = RetweetQueue.createInstance();

    try {
      const queue = await retweetQueue.fetchRetweetQueue();
      const tweet = queue.shift(); // pop item from queue

      if (!tweet) {
        console.log('Nothing to retweet');
        return false;
      }

      if (new Date(tweet.retweetTimestamp) > new Date()) {
        console.log('Retweet is scheduled in the future, skipping');
        return false; // Skip if retweet is scheduled for later
      }

      if (process.env.DRY_RUN == 'true') {
        console.log('[DRY_RUN] Skipping sending retweet');
        return false;
      }

      await this.sendRetweet(tweet.tweetId);

      await retweetQueue.saveRetweetQueue(queue);
    } catch (e) {
      console.log(e);

      return false;
    }

    return true;
  }

  async sendRetweet(tweetId) {
    await this._initTwitter();

    const postResult = await this.twitter
      .post(`statuses/retweet/${tweetId}`)
      .catch((error) => {
        console.log(error);
        return false;
      });

    console.log('retweet result', postResult);
  }

  /**
   * Init the Twitter SDK client with credentials provided by the credentialsStore.
   */
  async _initTwitter() {
    await this._fetchTwitterCredentials();

    this.twitter = new Twitter(this.twitterCredentials);
  }

  /**
   * Fetch the Twitter credentials from the secrets store.
   */
  async _fetchTwitterCredentials() {
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
