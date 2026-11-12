import type { RequestHandler } from 'express';

/**
 * CORS untuk frontend React (Vite, default http://localhost:5173).
 * Origin diatur lewat CORS_ORIGIN di .env. Header `Authorization` WAJIB diizinkan
 * supaya token JWT (Bearer) dari frontend bisa dikirim — tanpa ini, preflight gagal.
 */
export const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin = process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};
