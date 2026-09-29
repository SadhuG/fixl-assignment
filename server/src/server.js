const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  await connectDb(env.mongoUri);
  createApp().listen(env.port, () => console.log(`TaskHive API listening on :${env.port}`));
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
