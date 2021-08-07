module.exports = {
  tweets_csv_file: 'tweets.csv',
  mediaUrlFields: ['media_url_1', 'media_url_2', 'media_url_3', 'media_url_4'],

  tweets_log_file: 'tweet_history.log.json',
  max_tweet_log_length: 50,

  retweet_queue_file: 'retweetQueue.json',
  retweetDelayInHours: 5,

  aws: {
    tweets_s3_bucket: 'ww2twitterbot',
  },

  azure: {
    storageContainer: 'ww2twitterbotsa',
  },
};
