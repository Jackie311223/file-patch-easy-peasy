import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow frontend requests
  app.enableCors({
    origin: '*', // Allow all origins (only for development; restrict in production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unknown fields
      forbidNonWhitelisted: true, // Throw error for unknown fields
      transform: true, // Auto transform payload to DTO
    }),
  );

  // Set port (Manus will auto-assign PORT environment variable)
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
