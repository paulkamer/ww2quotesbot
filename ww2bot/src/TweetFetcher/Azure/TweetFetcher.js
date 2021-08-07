const { BlobServiceClient } = require('@azure/storage-blob');

const settings = require('../../../../config');
const { logger } = require('../../../../lib/logger');

const CSV_INPUT_CONFIGURATION = {
  inputTextConfiguration: {
    kind: 'csv',
    recordSeparator: '\n',
    hasHeaders: true,
  },
};

const JSON_OUTPUT_CONFIGURATION = {
  outputTextConfiguration: {
    kind: 'json',
    recordSeparator: ',',
  },
};
class AzureTweetFetcher {
  /**
   * Fetch a tweet by ID
   *
   * @param {Number} tweetId
   * @param {Object} params
   *
   * @returns JSON
   */
  async fetchTweetById(tweetId, params) {
    const queryParams = {
      ...params,
      ...CSV_INPUT_CONFIGURATION,
      ...JSON_OUTPUT_CONFIGURATION,
    };

    const sql = `
      SELECT * FROM BlobStorage
      WHERE id = ${tweetId}
      LIMIT 1
    `;

    return await this._executeSqlQuery(sql, queryParams);
  }

  /**
   * Fetch non-blacklisted tweets, for RandomTweet strategy
   *
   * Fetches relevant tweets that are on current day (ignoring year-part) OR tweets that
   * are not relevant within the next month (date excluding year > 1 month from now).
   */
  async fetchTweetsForRandomSelection({
    blacklistedIds,
    currentMonth,
    currentDay,
    nextMonth,
    limit,
  }) {
    const queryParams = {
      ...CSV_INPUT_CONFIGURATION,
      ...JSON_OUTPUT_CONFIGURATION,
    };

    const resultLimit = limit || 100;

    // Ensure list contains at least 1 (dummy) id, otherwise the query will fail.
    if (blacklistedIds.length === 0) blacklistedIds.push(-1);

    const sql = `
      SELECT * FROM BlobStorage
      WHERE (
        CAST(id as INT) NOT IN (${blacklistedIds.slice(0, 45).join(',')})
        AND checked = 'y'
        AND (
          COALESCE(quote_date, '') = ''
          OR (
            (
              EXTRACT(MONTH FROM COALESCE(quote_date, '') + 'T') = ${currentMonth}
              AND
              EXTRACT(DAY FROM COALESCE(quote_date, '') + 'T') = ${currentDay}
            )
            OR
            (
              EXTRACT(MONTH FROM COALESCE(quote_date, '') + 'T') NOT IN (${currentMonth},${nextMonth})
              OR
              EXTRACT(MONTH FROM COALESCE(quote_date, '') + 'T') = ${nextMonth} AND EXTRACT(DAY FROM COALESCE(quote_date, '') + 'T') > ${currentDay}
            )
          )
        )
      )
      LIMIT ${resultLimit}
    `;

    return await this._executeSqlQuery(sql, queryParams);
  }

  /**
   * Execute the SQL query on the TWEETS_CSV_FILE CSV file stored in S3
   *
   * @param {String} sql SQL query
   * @param {Object} params Params for selectObjectContent
   *
   * @returns String A string that can be parsed as JSON
   */
  async _executeSqlQuery(sqlQuery, params) {
    const connectionString = process.env.AZ_BLOB_CONN_STRING;

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString
    );
    const containerClient = blobServiceClient.getContainerClient(
      settings.azure.storageContainer
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      settings.tweets_csv_file
    );

    let resultString;
    try {
      const queryBlockBlobResponse = await blockBlobClient.query(
        sqlQuery,
        params
      );

      resultString = (
        await streamToBuffer(queryBlockBlobResponse.readableStreamBody)
      ).toString();
    } catch (err) {
      logger.error('_executeSqlQuery error', err);
      resultString = false;
    }

    return JSON.parse(`[${resultString.slice(0, -1)}]`);

    async function streamToBuffer(readableStream) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
          chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
      });
    }
  }
}

module.exports = AzureTweetFetcher;
