const { BlobServiceClient } = require('@azure/storage-blob');
const { logger } = require('../../logger');
const settings = require('../../../config');

module.exports = class AzureTweetLogStore {
  /**
   * Fetch the 'tweets log' file from Azure blob storage.
   *
   * It's used for logging which tweets were sent, so prevent sending the same
   * tweet again too soon.
   */
  async fetchTweetsLog() {
    logger.debug('fetchTweetsLog');

    const client = this._getBlockBlobClient();

    const downloadResponse = await client.download(0);
    const data = await this.streamToString(downloadResponse.readableStreamBody);

    return this._parseTweetsLogFile(data);
  }

  /**
   * Save the tweets log file to Azure blob storage
   * @param {Array} logData
   */
  async saveTweetsLog(logData = []) {
    logger.debug('saveTweetsLog');

    const client = this._getBlockBlobClient();

    const body = JSON.stringify(logData);
    await client.upload(body, body.length);
  }

  /**
   * Parse the contents of the tweets log file as JSON.
   *
   * @param {AWS.Request} file
   */
  _parseTweetsLogFile(file) {
    let jsonData = [];

    try {
      jsonData = JSON.parse(file.toString('utf-8') || '[]');
    } catch (e) {
      logger.error('parsing Tweets log as JSON failed', e);
    }

    return jsonData;
  }

  _getBlockBlobClient() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZ_BLOB_CONN_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      settings.azure.storageContainer
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      settings.tweets_log_file
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
