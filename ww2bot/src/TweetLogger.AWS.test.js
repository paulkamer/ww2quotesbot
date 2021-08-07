const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const sinon = require('sinon');
const settings = require('../../config');

const TweetLogger = require('./TweetLogger');
const TweetLogStore = require('../../lib/TweetLogStore/AWS');

describe('TweetLogger AWS', () => {
  describe('Fetching logged tweet IDs', () => {
    let tweetLogStoreStub;

    before(() => {
      const stubTweets = [
        { id: 123 },
        { id: 555 },
        { id: 555 }, // duplicate
      ];

      tweetLogStoreStub = sinon
        .stub(TweetLogStore.prototype, 'fetchTweetsLog')
        .callsFake(() => stubTweets);
    });

    it('Fetches an de-duplicates the logged tweet IDs', async () => {
      const tweetLogger = new TweetLogger(new TweetLogStore());

      const loggedTweets = await tweetLogger.fetchLoggedTweetIds();

      expect(loggedTweets.length).to.eql(2);
      expect(loggedTweets).to.eqls([123, 555]);
    });

    after(() => {
      tweetLogStoreStub.restore();
    });
  });

  describe('Fetching & modifying S3 files', () => {
    const logger = new TweetLogger(new TweetLogStore());

    afterEach(() => {
      AWS.restore();
    });

    describe('logTweet', async () => {
      let tweetLogStoreStub;

      beforeEach(() => {
        tweetLogStoreStub = sinon.stub(
          TweetLogStore.prototype,
          'saveTweetsLog'
        );
      });

      it('Logs a new tweet to the logfile', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync('testdata/mocks/tweet_history.log.json')
          ),
        });

        await logger.logTweet(123);

        sinon.assert.calledOnce(tweetLogStoreStub);
        expect(tweetLogStoreStub.firstCall.args[0].length).to.eql(3);
      });

      it('Logs a maximum number of tweets', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync(
              'testdata/mocks/tweet_history_full.log.json'
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
          tweetLogStoreStub.calledOnce,
          'saveTweetsLog should be called once'
        ).to.be.true;

        const args = tweetLogStoreStub.firstCall.args[0];
        expect(args.slice(-1)[0].id, 'New tweet is appended to the log').to.eql(
          newTweetId
        );
        expect(
          args.length,
          'Log file length does not exceed max length'
        ).to.eql(settings.max_tweet_log_length);
      });

      afterEach(() => {
        tweetLogStoreStub.restore();
      });
    });

    describe('fetchLoggedTweetIds', async () => {
      it('Fetches the logged tweet IDs', async () => {
        AWS.mock('S3', 'getObject', {
          Body: Buffer.from(
            require('fs').readFileSync('testdata/mocks/tweet_history.log.json')
          ),
        });

        const result = await logger.fetchLoggedTweetIds();

        expect(result).to.deep.equal([1, 2]);
      });
    });
  });
});
