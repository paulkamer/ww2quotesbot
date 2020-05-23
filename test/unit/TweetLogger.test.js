const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const sinon = require('sinon');
const settings = require('../../lambda/config');

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

  describe('Fetching & modifying S3 files', () => {
    const logger = new TweetLogger();

    afterEach(() => {
      AWS.restore();
    });

    describe('fetchTweetsLog', () => {
      it('Fetches an empty logfile and parses it as JSON', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              __dirname + '/../mocks/tweet_history_empty.log.json'
            )
          ),
        });

        const result = await logger.fetchTweetsLog();

        expect(result).to.eql([]);
      });

      it('Fetches non-empty logfile and parses it as JSON', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              __dirname + '/../mocks/tweet_history.log.json'
            )
          ),
        });

        const result = await logger.fetchTweetsLog();

        expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
      });
    });

    describe('fetchLoggedTweetIds', async () => {
      it('Fetches the logged tweet IDs', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              __dirname + '/../mocks/tweet_history.log.json'
            )
          ),
        });

        const result = await logger.fetchLoggedTweetIds();

        expect(result).to.deep.equal([1, 2]);
      });
    });

    describe('saveTweetsLog', async () => {
      it('Saves the tweet log array to file', async () => {
        const logData = [{ id: 6 }];

        AWS.mock('S3', 'putObject', {
          Body: logData,
        });

        const result = await logger.saveTweetsLog();

        expect(result).to.deep.equal({ Body: logData });
      });
    });

    describe('logTweet', async () => {
      let saveTweetsLogStub = null;

      beforeEach(() => {
        saveTweetsLogStub = sinon.stub(TweetLogger.prototype, 'saveTweetsLog');
      });

      it('Logs a new tweet to the logfile', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              __dirname + '/../mocks/tweet_history.log.json'
            )
          ),
        });

        await logger.logTweet(123);

        sinon.assert.calledOnce(saveTweetsLogStub);
        expect(saveTweetsLogStub.firstCall.args[0].length).to.eql(3);
      });

      it('Logs a maximum number of tweets', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              __dirname + '/../mocks/tweet_history_full.log.json'
            )
          ),
        });

        const tweetIds = await logger.fetchLoggedTweetIds();

        expect(tweetIds.length, 'Tweets log file should be "full"').to.eql(
          settings.max_tweet_log_length
        );

        const newTweetId = 123456;
        await logger.logTweet(newTweetId); // Log another tweet

        expect(
          saveTweetsLogStub.calledOnce,
          'saveTweetsLog should be called once'
        ).to.be.true;

        const args = saveTweetsLogStub.firstCall.args[0];
        expect(args.slice(-1)[0].id, 'New tweet is appended to the log').to.eql(
          newTweetId
        );
        expect(
          args.length,
          'Log file length does not exceed max length'
        ).to.eql(settings.max_tweet_log_length);
      });

      afterEach(() => {
        saveTweetsLogStub.restore();
      });
    });
  });
});
