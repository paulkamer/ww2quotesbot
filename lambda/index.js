'use strict';

const TwitterBot = require('./src/TwitterBot');
const { logger } = require('./src/lib/logger');

/**
 * Publish a specific tweet if a tweetId was sent with the event/request.
 * Otherwise a random one is chosen.
 */
exports.handler = async function (event, context, callback) {
  const bot = new TwitterBot();

  let tweetId = null;
  try {
    tweetId = parseTweetId(event);
  } catch (e) {
    return callback();
  }

  const result = await bot.publishTweet(tweetId);

  logger.info({ result });

  callback();
};

/**
 * Attempt to parse the (optional) tweetId from the event that was passed to the handler
 *
 * @param {Object} event
 * @throws Error If provided tweetId value in event object cannot be parsed as a Number
 *
 * @returns {Number | undefined | null}
 */
function parseTweetId(event) {
  let { tweetId } = event;

  try {
    if (tweetId) tweetId = Number(tweetId); // Validate/parse tweetId if provided.
  } catch (e) {
    logger.error('Parsing tweetId as Number failed', e);

    throw e;
  }

  return tweetId;
}
