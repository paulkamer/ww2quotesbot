'use strict';

const Retweeter = require('./src/Retweeter');

module.exports = async function (context) {
  context.log('Retweeter.handler');

  await new Retweeter().retweetLatestFromQueue();
};
