const aws = require('aws-sdk');

const { logger } = require('../../../lib/logger');

class S3SqlHandler {
  CSV_INPUT_SERIALIZATION = {
    InputSerialization: {
      CSV: {
        AllowQuotedRecordDelimiter: true,
        Comments: '#',
        FieldDelimiter: ',',
        FileHeaderInfo: 'USE',
        QuoteCharacter: '"',
        QuoteEscapeCharacter: '"',
        RecordDelimiter: '\n',
      },
    },
  };

  JSON_OUTPUT_SERIALIZATION = {
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ',',
      },
    },
  };

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
      ...this.CSV_INPUT_SERIALIZATION,
      ...this.JSON_OUTPUT_SERIALIZATION,
    };

    const sql = `
      SELECT * FROM S3Object
      WHERE CAST(id AS INT) = ${tweetId}
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
    params,
  }) {
    const queryParams = {
      ...params,
      ...this.CSV_INPUT_SERIALIZATION,
      ...this.JSON_OUTPUT_SERIALIZATION,
    };

    const resultLimit = limit || 100;

    // Ensure list contains at least 1 (dummy) id, otherwise the query will fail.
    if (blacklistedIds.length === 0) blacklistedIds.push(-1);

    const sql = `
      SELECT * FROM S3Object
      WHERE (
        NOT CAST(id as INT) IN (${blacklistedIds.join(',')})
        AND checked = 'y'
        AND (
          (quote_date = NULL OR quote_date = '')
          OR (
            (
              EXTRACT(MONTH FROM CAST(quote_date as TIMESTAMP)) = ${currentMonth}
              AND
              EXTRACT(DAY FROM CAST(quote_date as TIMESTAMP)) = ${currentDay}
            )
            OR
            (
              NOT EXTRACT(MONTH FROM CAST(quote_date as TIMESTAMP)) IN (${currentMonth},${nextMonth})
              OR
              EXTRACT(MONTH FROM CAST(quote_date as TIMESTAMP)) = ${nextMonth} AND EXTRACT(DAY FROM CAST(quote_date as TIMESTAMP)) > ${currentDay}
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
  async _executeSqlQuery(sql, params) {
    const s3 = new aws.S3();

    const queryParams = {
      ...params,
      Expression: sql,
      ExpressionType: 'SQL',
    };

    let resultString;
    try {
      const result = await s3.selectObjectContent(queryParams).promise();

      let records = [];
      for await (const event of result.Payload) {
        if (event.Records) {
          records.push(event.Records.Payload);
        } else if (event.End) {
          resultString = Buffer.concat(records).toString('utf8');

          resultString = resultString.replace(/,$/, ''); // remove any trailing commas

          if (params.OutputSerialization.JSON) {
            resultString = `[${resultString}]`; // Ensure string can be parsed as JSON array
          }
        }
      }
    } catch (err) {
      logger.error('_executeSqlQuery error', err);
      resultString = false;
    }

    return resultString;
  }
}

module.exports = S3SqlHandler;
