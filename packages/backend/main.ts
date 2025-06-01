// packages/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thêm global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // CORS configuration - hỗ trợ nhiều cổng
  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: false
  }));

  const port = 3002; // Đổi từ 3001 sang 3002
  await app.listen(port, '0.0.0.0');
  console.log(`Backend application is running on: ${await app.getUrl()}`);
}
bootstrap();