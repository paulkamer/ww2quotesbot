'use strict';

const TwitterBot = require('./src/TwitterBot');
const { logger } = require('../lib/logger');

/**
 * Publish a specific tweet if a tweetId was sent with the event/request.
 * Otherwise a random one is chosen.
 */
module.exports = async function (context, req) {
  const bot = new TwitterBot();

  let tweetId = null;
  try {
    tweetId = parseTweetId(req.query);
  } catch (e) {
    logger.error(e);
    return;
  }

  const result = await bot.publishTweet(tweetId);

  logger.info({ result });
};

/**
 * Attempt to parse the (optional) tweetId from the event that was passed to the handler
 *
 * @param {Object} event
 *
 * @returns {Number | undefined | null}
 */
function parseTweetId(event) {
  let tweetId = null;

  // Validate/parse tweetId if provided.
  if (event && event.tweetId) {
    tweetId = Number(event.tweetId);
  }

  return tweetId;
}
