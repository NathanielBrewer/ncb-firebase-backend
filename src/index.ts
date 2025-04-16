import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: {
    name: __filename,
    level: 'info',
  },
});

server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
server.register(cors, { 
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(' ') ?? [],
  exposedHeaders: ['Content-Type', 'X-Content-Type', 'Content-Disposition'], 
});
/** ratelimit returns this error if limit exceeded
 * {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded, retry in 1 minute'
  }
 */
(async function () {
  await server.register(rateLimit, {
    global: true,
    max: 2,
    timeWindow: 1000
  })
})();

server.register(routes);

server.listen({port: Number(process.env.PORT) || 3000, host: process.env.HOST ?? '127.0.0.1'}, (error: Error | null, address: string | number) => {
  if (error) {
    server.log.error(error);
  }
  server.log.info(`Server listening on ${address}`);
});
