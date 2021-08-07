const TweetLogger = require('../../TweetLogger');
const { logger } = require('../../../../lib/logger');

/**
 * Strategy to fetch a random tweet
 *
 * A random tweet needs to be selected, however the following criteria should
 * be respected:
 *
 * 1. A tweet may not have been tweeted already recently
 * 2. Favor a "date-relevant" tweet (same day and month as current day)
 *   2.1. If no such tweet is available tweets, exclude date-relevant tweets of
 *        next 4 weeks.
 */
class RandomTweet {
  constructor(tweetFetcher) {
    this.tweetFetcher = tweetFetcher;
  }

  /**
   * Fetch a random tweet
   */
  async fetchTweet() {
    logger.debug('RandomTweet.fetchTweet');

    const blacklistedIds = await TweetLogger.createInstance().fetchLoggedTweetIds();

    logger.debug(`blacklistedIds: ${blacklistedIds}`);

    const currentMonth = new Date().getMonth() + 1; // Month numbers start at zero, ...
    const currentDay = new Date().getDate(); // but day numbers do not ¯\_(ツ)_/¯
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1; // after December (12) comes January (1)

    // Query available tweets
    const result = await this.tweetFetcher.fetchTweetsForRandomSelection({
      blacklistedIds,
      currentMonth,
      currentDay,
      nextMonth,
    });

    const tweets = result;

    let tweet;
    tweet = this.pickTweetOnSameDay(tweets, currentMonth, currentDay); // Favor a tweet of the same day
    if (!tweet) tweet = this.pickRandomTweet(tweets); // Otherwise, pick a random one

    if (!tweet) {
      logger.error('Could not pick a random tweet');
      return false;
    }

    return tweet;
  }

  /**
   * Find a tweet that's on the month and day as the given month and day.
   *
   * @param {Array<Object>} tweets Array JSON objects
   * @param {Number} month
   * @param {Number} day
   */
  pickTweetOnSameDay(tweets, month, day) {
    const dayPart = day < 10 ? `0?${day}` : day;
    const monthPart = month < 10 ? `0?${month}` : month;

    // Matches date string with format: "2020-(0)3-(0)4"
    const sameDayRegex = new RegExp(`\\d{4}-${monthPart}-${dayPart}`);

    return tweets.find((t) => sameDayRegex.test(t.quote_date));
  }

  /**
   * Pick a random tweet from the given list of tweets, but one that is not flagged as otd_only
   *
   * @param {Array<Object>} tweets
   * @returns {Object}
   */
  pickRandomTweet(tweets) {
    const tweetsExcludingOtdOnly = tweets.filter((t) => t.otd_only !== 'y');

    return tweetsExcludingOtdOnly[
      Math.floor(Math.random() * tweetsExcludingOtdOnly.length)
    ];
  }
}

module.exports = RandomTweet;
