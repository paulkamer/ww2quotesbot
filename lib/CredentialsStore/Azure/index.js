const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

/**
 * Class for handling fetching data from the AWS System Manager Parameter Store,
 * and decrypting it with AWS Key Management Service
 */
module.exports = class CredentialsStore {
  constructor() {
    const credential = new DefaultAzureCredential();

    const url = `https://${process.env.KEYVAULT_NAME}.vault.azure.net`;

    this.client = new SecretClient(url, credential);
  }

  /**
   * Fetch encrypted parameter from the SSM Parameter Store
   */
  async fetchParameter({ parameterName }) {
    const secret = await this.client.getSecret(parameterName);

    return JSON.parse(secret.value);
  }
};
