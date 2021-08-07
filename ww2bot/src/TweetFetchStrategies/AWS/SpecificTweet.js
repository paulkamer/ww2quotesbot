const settings = require('../../../../config');
const JsonParser = require('../../TweetFetcher/AWS/ResultParsers/JsonParser');
const { logger } = require('../../../../lib/logger');

/**
 * Strategy to fetch a specific tweet by it's id.
 */
class SpecificTweet {
  constructor(tweetId, tweetFetcher) {
    this.tweetId = tweetId;
    this.tweetFetcher = tweetFetcher;
  }

  /**
   * Fetch a specific tweet.
   */
  async fetchTweet() {
    logger.debug('SpecificTweet.fetchTweet');

    const params = {
      Bucket: settings.aws.tweets_s3_bucket,
      Key: settings.tweets_csv_file,
    };

    const result = await this.tweetFetcher.fetchTweetById(this.tweetId, params);

    const parsedResult = new JsonParser(result).parse();

    return parsedResult['0'];
  }
}

module.exports = SpecificTweet;
