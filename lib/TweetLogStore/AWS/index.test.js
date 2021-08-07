const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;

const TweetLogStore = require('.');

describe('TweetLogStore AWS', () => {
  const store = new TweetLogStore();

  afterEach(() => {
    AWS.restore();
  });

  describe('fetchTweetsLog', () => {
    it('Fetches an empty logfile and parses it as JSON', async () => {
      AWS.mock('S3', 'getObject', {
        Body: Buffer.from(
          require('fs').readFileSync(
            'testdata/mocks/tweet_history_empty.log.json'
          )
        ),
      });

      const result = await store.fetchTweetsLog();

      expect(result).to.eql([]);
    });

    it('Fetches non-empty logfile and parses it as JSON', async () => {
      AWS.mock('S3', 'getObject', {
        Body: Buffer.from(
          require('fs').readFileSync('testdata/mocks/tweet_history.log.json')
        ),
      });

      const result = await store.fetchTweetsLog();

      expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('saveTweetsLog', async () => {
    const store = new TweetLogStore();

    it('Saves the tweet log array to file', async () => {
      const logData = [{ id: 6 }];

      AWS.mock('S3', 'putObject', {
        Body: logData,
      });

      const result = await store.saveTweetsLog();

      expect(result).to.deep.equal({ Body: logData });
    });
  });

  describe('_parseTweetsLogFile', () => {
    it('Parses a AWS Request file object as (an empty) JSON object', () => {
      const store = new TweetLogStore();

      const file = {
        Body: '[]',
      };

      const parsedFile = store._parseTweetsLogFile(file);

      expect(parsedFile).to.eql([]);
    });

    it('Parses a AWS Request file object as a JSON object', () => {
      const store = new TweetLogStore();

      const file = {
        Body: '[{"id": 123}]',
      };

      const parsedFile = store._parseTweetsLogFile(file);

      expect(parsedFile).to.eql([{ id: 123 }]);
    });
  });
});
