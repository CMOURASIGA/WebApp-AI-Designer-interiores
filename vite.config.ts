import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Middleware plugin to serve /api/* locally reusing the handlers in api/*
const localApiPlugin = (): Plugin => ({
  name: 'local-api-plugin',
  configureServer(server) {
    const jsonResponse = (res: any, status: number, data: any) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/')) return next();

      let raw = '';
      req.on('data', chunk => (raw += chunk));
      req.on('end', async () => {
        let body: any = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch (e) {
          return jsonResponse(res, 400, { error: 'Invalid JSON' });
        }

        const resObj = {
          status(code: number) {
            res.statusCode = code;
            return resObj;
          },
          json(data: any) {
            return jsonResponse(res, res.statusCode || 200, data);
          },
        };

        try {
          if (req.url === '/api/chat') {
            const handler = (await import('./api/chat.js')).default;
            return handler({ method: req.method, body } as any, resObj as any);
          }
          if (req.url === '/api/suggestions') {
            const handler = (await import('./api/suggestions.js')).default;
            return handler({ method: req.method, body } as any, resObj as any);
          }
          if (req.url === '/api/image') {
            const handler = (await import('./api/image.js')).default;
            return handler({ method: req.method, body } as any, resObj as any);
          }
          return jsonResponse(res, 404, { error: 'Not found' });
        } catch (err) {
          console.error('Local API error', err);
          return jsonResponse(res, 500, { error: 'Internal error' });
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  // Carrega variaveis do .env.* e injeta no process.env
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (env.AI_PROVIDER) process.env.AI_PROVIDER = env.AI_PROVIDER;
  if (env.IMAGE_BUCKET_NAME) process.env.IMAGE_BUCKET_NAME = env.IMAGE_BUCKET_NAME;
  if (env.IMAGE_BUCKET_BASE_URL) process.env.IMAGE_BUCKET_BASE_URL = env.IMAGE_BUCKET_BASE_URL;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), localApiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
      'process.env.AI_PROVIDER': JSON.stringify(env.AI_PROVIDER),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
