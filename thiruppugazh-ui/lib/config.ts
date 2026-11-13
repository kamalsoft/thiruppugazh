// Set NEXT_PUBLIC_API_BASE_URL in .env.local to point at a local API (for example http://localhost:5000/api).
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://thiruppugazh-api.vercel.app/api',
  DEFAULT_LIMIT: 12,
};
