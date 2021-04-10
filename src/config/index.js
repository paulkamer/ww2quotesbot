module.exports = {
  tweets_s3_bucket: 'ww2twitterbot',
  tweets_csv_file: 'tweets.csv',
  tweets_log_file: 'tweet_history.log.json',

  retweet_queue_file: 'retweetQueue.json',

  retweetDelayInHours: 5,

  max_tweet_log_length: 50,

  mediaUrlFields: ['media_url_1', 'media_url_2', 'media_url_3', 'media_url_4'],
};
