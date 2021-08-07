const { BlobServiceClient } = require('@azure/storage-blob');
const settings = require('../../../config');

module.exports = class AzureRetweetQueueStore {
  /**
   * Fetch the 'tweets log' file from blob storage.
   *
   * It's used for logging which tweets were sent, so prevent sending the same
   * tweet again too soon.
   */
  async fetchRetweetQueue() {
    const client = this._getBlockBlobClient();

    const downloadResponse = await client.download(0);
    const data = await this.streamToString(downloadResponse.readableStreamBody);

    return this._parseRetweetQueueFile(data);
  }

  /**
   * Save the tweets log file to blob storage.
   * @param {Array} queueData
   */
  async saveRetweetQueue(queueData = []) {
    console.log('saveTweetsLog');

    const client = this._getBlockBlobClient();

    const body = JSON.stringify(queueData);
    await client.upload(body, body.length);
  }

  /**
   * Parse the retweet queue file as JSON
   *
   * @param {AWS.Request} file retweetQueueFile
   */
  _parseRetweetQueueFile(retweetQueueFile) {
    let queue = [];

    try {
      queue = JSON.parse(retweetQueueFile.toString('utf-8') || '[]');
    } catch (e) {
      console.log('parsing retweet queue file failed', e);
    }

    return queue;
  }

  _getBlockBlobClient() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZ_BLOB_CONN_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      settings.azure.storageContainer
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      settings.retweet_queue_file
    );

    return blockBlobClient;
  }

  // A helper function used to read a Node.js readable stream into a string
  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }
};
