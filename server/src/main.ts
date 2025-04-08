import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function startServer() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });
  app.use(cookieParser());
  await app.listen(6789);
}
startServer();
