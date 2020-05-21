const expect = require('chai').expect;
const sinon = require('sinon');

const TweetLogger = require('../../lambda/src/TweetLogger');

describe('TweetLogger', () => {
  describe('Fetching logged tweet IDs', () => {
    let TweetLoggerStub;
    before(() => {
      const stubTweets = [
        { id: 123 },
        { id: 555 },
        { id: 555 }, // Note id 555 is duplicate
      ];

      TweetLoggerStub = sinon
        .stub(TweetLogger.prototype, 'fetchTweetsLog')
        .callsFake(() => stubTweets);
    });

    it('Fetches an de-duplicates the logged tweet IDs', async () => {
      const tweetLogger = new TweetLogger();

      const loggedTweets = await tweetLogger.fetchLoggedTweetIds();

      expect(loggedTweets.length).to.eql(2);
      expect(loggedTweets).to.eqls([123, 555]);
    });

    after(() => {
      TweetLoggerStub.restore();
    });
  });

  describe('parseTweetsLogFile', () => {
    it('Parses a AWS Request file object as (an empty) JSON object', () => {
      const logger = new TweetLogger();

      const file = {
        Body: '[]',
      };

      const parsedFile = logger.parseTweetsLogFile(file);

      expect(parsedFile).to.eql([]);
    });

    it('Parses a AWS Request file object as a JSON object', () => {
      const logger = new TweetLogger();

      const file = {
        Body: '[{"id": 123}]',
      };

      const parsedFile = logger.parseTweetsLogFile(file);

      expect(parsedFile).to.eql([{ id: 123 }]);
    });
  });
});
