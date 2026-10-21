let queuePromise = null;

const getQueue = () => {
  if (!queuePromise) {
    queuePromise = import("p-queue").then(({ default: PQueue }) => {
      return new PQueue({ concurrency: 1 });
    });
  }
  return queuePromise;
};

// Initialize queue in background
getQueue();

const emailQueue = {
  add: async (fn, options) => {
    const queue = await getQueue();
    return queue.add(fn, options);
  },
  onIdle: async () => {
    const queue = await getQueue();
    return queue.onIdle();
  },
  clear: async () => {
    const queue = await getQueue();
    return queue.clear();
  },
  getQueue,
};

module.exports = emailQueue;

