import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS với domain cụ thể
  app.enableCors({
    origin: [
      'http://localhost:5173', // local dev
      'https://pms-roomrise-main-git-main-duy-tais-projects.vercel.app', // vercel
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Start application
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
