import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function startServer() {
  const app = await NestFactory.create(AppModule);
  await app.listen(6789);
}
startServer();
