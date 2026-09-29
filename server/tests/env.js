process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://unused-in-tests';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.BCRYPT_COST = '4';
