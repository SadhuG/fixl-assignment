const os = require('os');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  // MongoDB driver 7 loads `os` via dynamic import(), which Jest's CommonJS sandbox rejects;
  // the driver then sends an empty handshake and mongod refuses it. Hand it `os` directly.
  await mongoose.connect(mongo.getUri(), { runtimeAdapters: { os } });
  // Unique indexes build asynchronously; wait so duplicate-key tests are reliable.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
