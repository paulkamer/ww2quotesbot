const aws = require('aws-sdk');
const { logger } = require('../../logger');

/**
 * Class for handling fetching data from the AWS System Manager Parameter Store,
 * and decrypting it with AWS Key Management Service
 */
module.exports = class CredentialsStore {
  constructor() {
    this.ssm = new aws.SSM();
  }

  /**
   * Fetch encrypted parameter from the SSM Parameter Store
   */
  async fetchParameter({ parameterName }) {
    const params = {
      Name: parameterName,
    };

    const encryptedCredentials = await this.ssm
      .getParameter(params)
      .promise()
      .then((data) => {
        return data.Parameter.Value;
      })
      .catch((err) => logger.error(err));

    return await this.decryptParameterValue(encryptedCredentials);
  }

  /**
   * Decrypt SSM Parameter Store value with KMS
   *
   * @param {String} encryptedValue Base64-encoded string that was encrypted
   * with KMS.
   * @returns JSON | null
   */
  async decryptParameterValue(encryptedValue) {
    return await new aws.KMS()
      .decrypt({ CiphertextBlob: Buffer.from(encryptedValue, 'base64') })
      .promise()
      .then((data) => {
        return JSON.parse(data.Plaintext.toString());
      })
      .catch((err) => logger.error(err));
  }
};
