const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];

function loadEnv(source) {
  const missing = REQUIRED.filter((key) => !source[key]);
  if (missing.length) throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  if (source.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

  return Object.freeze({
    nodeEnv: source.NODE_ENV || 'development',
    isProd: source.NODE_ENV === 'production',
    port: Number(source.PORT) || 4000,
    mongoUri: source.MONGODB_URI,
    jwtSecret: source.JWT_SECRET,
    clientOrigins: source.CLIENT_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    bcryptCost: Number(source.BCRYPT_COST) || 12,
    trustProxy: Number(source.TRUST_PROXY ?? 1),
  });
}

module.exports = { env: loadEnv(process.env), loadEnv };
