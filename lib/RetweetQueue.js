module.exports = class RetweetQueue {
  constructor(retweetQueueStore) {
    this.retweetQueueStore = retweetQueueStore;
  }

  static createInstance() {
    const retweetQueueStore =
      process.env['PLATFORM'] == 'AWS'
        ? require('./RetweetQueueStore/AWS')
        : require('./RetweetQueueStore/Azure');

    return new RetweetQueue(new retweetQueueStore());
  }

  /**
   * Fetch the 'tweets log' file from the store.
   *
   * It's used for logging which tweets were sent, so prevent sending the same
   * tweet again too soon.
   */
  async fetchRetweetQueue() {
    return await this.retweetQueueStore.fetchRetweetQueue();
  }

  /**
   * Save the tweets log file to the store
   * @param {Array} queueData
   */
  async saveRetweetQueue(queueData = []) {
    return await this.retweetQueueStore.saveRetweetQueue(queueData);
  }
};
