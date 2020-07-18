const expect = require('chai').expect;

const RandomTweet = require('../../../src/ww2bot/src/TweetFetchStrategies/RandomTweet');

describe('RandomTweet fetch strategy', () => {
  describe('pickTweetOnSameDay', () => {
    const randomTweet = new RandomTweet();

    const tweets = [
      { id: 1, quote_date: '1943-3-1' },
      { id: 2, quote_date: '1944-08-12' },
      { id: 3, quote_date: '1942-5-01' },
      { id: 4, quote_date: '1942-5-17' },
    ];

    it('Picks a tweet thats from the same month+day', () => {
      const result = randomTweet.pickTweetOnSameDay(tweets, 3, 1);

      expect(result).to.eql(tweets[0]);
    });

    it('Picks a tweet thats from the same month+day, month having leading zero', () => {
      const result = randomTweet.pickTweetOnSameDay(tweets, 8, 12);

      expect(result).to.eql(tweets[1]);
    });

    it('Picks a tweet thats from the same month+day, day having leading zero', () => {
      const result = randomTweet.pickTweetOnSameDay(tweets, 5, 1);

      expect(result).to.eql(tweets[2]);
    });

    it('Returns undefined when passing empty tweets list', () => {
      const result = randomTweet.pickTweetOnSameDay([], 1, 1);

      expect(result).to.eql(undefined);
    });
  });

  describe('pickRandomTweet', () => {
    const tweets = ['a', 'b'];

    it('returns a random tweet', () => {
      let result = true;

      // Pick a random one 20 times; check that undefined is never returned.
      result = Array.from({ length: 20 }, () =>
        new RandomTweet().pickRandomTweet(tweets)
      ).includes(undefined);

      expect(result).to.eql(false);
    });

    it('excludes otd_only tweets', () => {
      const tweets = [
        { tweet_text: 'abc', otd_only: 'y' },
        { tweet_text: 'def', otd_only: '' },
      ];

      const result = new RandomTweet().pickRandomTweet(tweets);

      expect(result.tweet_text).to.eql('def');
    });

    it('returns undefined when no non-otd_only tweet is available', () => {
      const tweets = [{ tweet_text: 'abc', otd_only: 'y' }];

      const result = new RandomTweet().pickRandomTweet(tweets);

      expect(result).to.eql(undefined);
    });
  });
});
