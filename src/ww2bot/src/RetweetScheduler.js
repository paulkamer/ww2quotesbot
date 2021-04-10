const settings = require('../../config');
const { logger } = require('../../lib/logger');
const RetweetQueue = require('../../lib/RetweetQueue');

/**
 * Log tweets that were sent to a log file.
 * Also supports fetching all logged tweet IDs.
 */
module.exports = class RetweetScheduler {
  constructor(tweetId) {
    this.tweetId = tweetId;
    this.retweetQueue = new RetweetQueue();
  }

  async schedule() {
    logger.debug('RetweetScheduler.schedule');

    const queue = await this.retweetQueue.fetchRetweetQueue();

    const retweetTimestamp = this.generateRetweetTimestamp();
    queue.push({ tweetId: this.tweetId, retweetTimestamp });

    logger.debug('new retweet queue', queue);

    return await this.retweetQueue.saveRetweetQueue(queue);
  }

  generateRetweetTimestamp() {
    const date = new Date();
    date.setHours(date.getHours() + settings.retweetDelayInHours);

    return date.toISOString();
  }
};
