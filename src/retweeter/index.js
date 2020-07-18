'use strict';

const RetweetQueue = require('../lib/RetweetQueue');
const Retweeter = require('./Retweeter');

exports.handler = async function (event, context, callback) {
  console.log('Retweeter');

  const retweetQueue = new RetweetQueue();

  try {
    const queue = await retweetQueue.fetchRetweetQueue();
    const tweet = queue.shift(); // pop item from queue

    if (!tweet) {
      console.log('Nothing to retweet');
      return false;
    }

    if (new Date(tweet.retweetTimestamp) > new Date()) return false; // Skip if retweet is scheduled for later

    await invokeRetweet(tweet.tweetId);

    retweetQueue.saveRetweetQueue(queue);
  } catch (e) {
    console.error(e);

    return false;
  }

  callback();
};

/**
 * Invoke the main ww2botlambda Lambda function to retweet the tweet.
 *
 * @param {number} tweetId
 */
async function invokeRetweet(tweetId) {
  const retweeter = new Retweeter(tweetId);

  retweeter.retweet();
}
