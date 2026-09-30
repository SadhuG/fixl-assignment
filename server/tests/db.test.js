const mongoose = require('mongoose');
const { connectDb } = require('../src/config/db');

afterEach(() => jest.restoreAllMocks());

test('startup rejects standalone MongoDB with an actionable error', async () => {
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
  jest.spyOn(mongoose.connection.db, 'command').mockResolvedValue({ isWritablePrimary: true });
  const disconnect = jest.spyOn(mongoose, 'disconnect').mockResolvedValue();
  await expect(connectDb('mongodb://unused')).rejects.toThrow(/replica set.*transactions/i);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test.each([{ setName: 'rs0' }, { msg: 'isdbgrid' }])(
  'startup accepts transaction-capable topology %j',
  async (hello) => {
    jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    jest.spyOn(mongoose.connection.db, 'command').mockResolvedValue(hello);
    await expect(connectDb('mongodb://unused')).resolves.toBe(mongoose.connection);
  },
);
