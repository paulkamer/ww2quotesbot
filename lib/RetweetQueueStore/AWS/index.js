const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const settings = require('../../../config');

module.exports = class RetweetQueueStore {
  /**
   * Fetch the 'tweets log' file from S3.
   *
   * It's used for logging which tweets were sent, so prevent sending the same
   * tweet again too soon.
   */
  async fetchRetweetQueue() {
    const file = await S3.getObject({
      Bucket: settings.aws.tweets_s3_bucket,
      Key: settings.retweet_queue_file,
    })
      .promise()
      .catch((e) => {
        console.log(e);

        return false;
      });

    return this._parseRetweetQueueFile(file);
  }

  /**
   * Save the tweets log file to S3
   * @param {Array} queueData
   */
  async saveRetweetQueue(queueData = []) {
    console.log('saveTweetsLog');

    await S3.putObject({
      Bucket: settings.aws.tweets_s3_bucket,
      Key: settings.retweet_queue_file,
      Body: JSON.stringify(queueData),
    }).promise();
  }

  /**
   * Parse the retweet queue file as JSON
   *
   * @param {AWS.Request} file retweetQueueFile
   */
  _parseRetweetQueueFile(retweetQueueFile) {
    let queue = [];

    try {
      queue = JSON.parse(retweetQueueFile.Body.toString('utf-8') || '[]');
    } catch (e) {
      console.log('parsing retweet queue file failed', e);
    }

    return queue;
  }
};
