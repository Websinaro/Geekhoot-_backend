import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] || fallback;
  if (!val) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
  return val;
}

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: isProd
    ? requireEnv('JWT_SECRET')
    : (process.env.JWT_SECRET || 'dev_secret_change_in_prod'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: requireEnv('DATABASE_URL'),
  adminEmail: process.env.ADMIN_EMAIL?.toLowerCase().trim() || '',
};
