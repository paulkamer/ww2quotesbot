const expect = require('chai').expect;

const TweetStatusFormatter = require('../../lambda/src/TweetStatusFormatter');

describe('TweetStatusFormatter', () => {
  describe('splitString', () => {
    let formatter;
    beforeEach(() => {
      formatter = new TweetStatusFormatter();
    });

    it('Splits a comma-separated string', () => {
      const result = formatter.splitString('#hash1,#hash2');

      expect(result).to.eql('#hash1 #hash2');
    });

    it('Splits a comma-separated string, and trimming whitespace', () => {
      const result = formatter.splitString(
        '   #hash1, #hash2, #hash3  ,#hash4'
      );

      expect(result).to.eql('#hash1 #hash2 #hash3 #hash4');
    });

    it('Returns an unmodified string that doesnt contain a comma', () => {
      const result = formatter.splitString('This is a regular string');

      expect(result).to.eql('This is a regular string');
    });

    it('Returns a trimmed string that doesnt contain a comma', () => {
      const result = formatter.splitString('    test test test ');

      expect(result).to.eql('test test test');
    });
  });

  describe('formatTweetStatusString', () => {
    const testTweets = [
      {
        it: 'Formats a plain tweet status string',
        tweet: {
          tweet_text: 'Abc',
        },
        expectedResult: 'Abc',
      },
      {
        it: 'Formats a tweet status string containing a hashtag',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1',
        },
        expectedResult: 'Abc #hashtag1',
      },
      {
        it: 'Formats a tweet status string containing multiple hashtags',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1, #hashtag2',
        },
        expectedResult: 'Abc #hashtag1 #hashtag2',
      },
      {
        it: 'Formats a tweet status string containing a link',
        tweet: {
          tweet_text: 'Abc',
          links: 'https://google.com',
        },
        expectedResult: 'Abc https://google.com',
      },
      {
        it: 'Formats a tweet status string containing multiple links',
        tweet: {
          tweet_text: 'Abc',
          links: 'https://google.com, https://cnn.com',
        },
        expectedResult: 'Abc https://google.com https://cnn.com',
      },
      {
        it:
          'Formats a tweet status string containing multiple links and multiple hashtags',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1, #hashtag2',
          links: 'https://google.com, https://cnn.com',
        },
        expectedResult:
          'Abc https://google.com https://cnn.com #hashtag1 #hashtag2',
      },
    ];

    testTweets.forEach((tweet) => {
      it(tweet.it, () => {
        const tweetString = new TweetStatusFormatter(
          tweet.tweet
        ).formatTweetStatusString();

        expect(tweetString).to.eql(tweet.expectedResult);
      });
    });
  });

  describe('formatTweetStatusString with #OTD hashtag', () => {
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();

    const testTweets = [
      {
        it:
          'Does not add #OTD hash for tweets without a quote_date (empty string)',
        tweet: {
          tweet_text: 'Abc',
          quote_date: '',
        },
        expectedResult: 'Abc',
      },
      {
        it: 'Does not add #OTD hash for tweets without a quote_date (null)',
        tweet: {
          tweet_text: 'Abc',
          quote_date: null,
        },
        expectedResult: 'Abc',
      },
      {
        it:
          'Does not add #OTD hash for tweets without a quote_date (property not set)',
        tweet: {
          tweet_text: 'Abc',
        },
        expectedResult: 'Abc',
      },
      {
        it: 'Formats a tweet status string containing a hashtag',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1',
          quote_date: `1944-0${month}-${day}`,
        },
        expectedResult: 'Abc #hashtag1 #OTD',
      },
      {
        it:
          'Does not add #OTD hash when quote_date day differs from current day',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1, #hashtag2',
          quote_date: `1944-0${month}-${day + 1}`,
        },
        expectedResult: 'Abc #hashtag1 #hashtag2',
      },
      {
        it:
          'Does not add #OTD hash when quote_date month differs from current month',
        tweet: {
          tweet_text: 'Abc',
          hashtags: '#hashtag1, #hashtag2',
          quote_date: `1944-0${month + 1}-${day}`,
        },
        expectedResult: 'Abc #hashtag1 #hashtag2',
      },
    ];

    testTweets.forEach((tweet) => {
      it(tweet.it, () => {
        const tweetString = new TweetStatusFormatter(
          tweet.tweet
        ).formatTweetStatusString();

        expect(tweetString).to.include(tweet.expectedResult);
      });
    });
  });
});
