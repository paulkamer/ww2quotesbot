/**
 * Format a Twitter status message
 */
module.exports = class TweetStatusFormatter {
  /**
   * @param {Object} tweet
   */
  constructor(tweet) {
    this.tweet = tweet;
  }

  /**
   * Format the tweet 'status' message
   *
   * @todo implement check to prevent exceeding the 280 character limit, keeping
   *       in mind that Twitter shortens any link to a to.co/... link, that are
   *       *always* 23 characters in length.
   */
  formatTweetStatusString() {
    const tweetText = this.tweet.tweet_text;

    const links = this.tweet.links ? this.splitString(this.tweet.links) : '';
    const hashtags = this.tweet.hashtags
      ? this.splitString(this.tweet.hashtags)
      : '';

    // TODO support media
    // TODO include the "#OTD" (On This Day) hashtag, when tweet's date is
    //      equal to current date (ignoring the Year part)

    return [tweetText, links, hashtags]
      .map((x) => x.trim())
      .filter((x) => x !== '')
      .join(' ');
  }

  /**
   * Splits a string (typically comma-separated) and trims any excess whitespace from the parts.
   *
   * @param {String} inputString
   * @param {String} splitSeparator character to split the string on
   * @param {String} joinSeparator character to join the string parts with
   *
   * @returns {String}
   */
  splitString(inputString, splitSeparator = ',', joinSeparator = ' ') {
    return inputString
      .split(splitSeparator)
      .map((part) => part.trim())
      .join(joinSeparator);
  }
};
