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

    const links = this.tweet.links
      ? this.splitString(this.tweet.links).join(' ')
      : '';

    const hashtags = this.formatHashtagsString();

    return [tweetText, links, hashtags]
      .map((x) => x.trim())
      .filter((x) => x !== '')
      .join(' ');
  }

  /**
   * Format a string containing hashtags
   *
   * Adds #OTD hashtag when tweet was on current day+month
   * Adds #WW2 & #WWII
   */
  formatHashtagsString() {
    let hashtags = this.tweet.hashtags
      ? this.splitString(this.tweet.hashtags)
      : [];

    // Include "#OTD" hashtag when quote_date has same day+month
    if (this.isTweetOnThisDay) hashtags.push('#OTD');

    hashtags.push('#WW2', '#WWII');

    return hashtags.map((h) => h.trim()).join(' ');
  }

  /**
   * Splits a string (typically comma-separated) and trims any excess whitespace from the parts.
   *
   * @param {String} inputString
   * @param {String} separator character to split the string on
   *
   * @returns Array
   */
  splitString(inputString, separator = ',') {
    return inputString.split(separator).map((part) => part.trim());
  }

  /**
   * Determine if the quote_date of the tweet is "on the same day" (has the same
   * day and month).
   */
  get isTweetOnThisDay() {
    if (!this.tweet.quote_date) return false;

    let month = new Date().getMonth() + 1;
    month = month === 12 ? 1 : month;
    const day = new Date().getDate();

    const dayPart = day < 10 ? `0?${day}` : day;
    const monthPart = month < 10 ? `0?${month}` : month;

    // Matches date string with format: "2020-(0)3-(0)4"
    const sameDayRegex = new RegExp(`\\d{4}-${monthPart}-${dayPart}`);

    return sameDayRegex.test(this.tweet.quote_date);
  }
};
