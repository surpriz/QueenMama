import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppModule } from './app.module';

// Load environment variables before anything else (override: true to force reload)
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Log CORS origin for debugging
  const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  logger.log(`CORS Origin configured: ${corsOrigin}`);

  const app = await NestFactory.create(AppModule);

  // Cookie parser for httpOnly cookies
  app.use(cookieParser());

  // Security
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Queen Mama API')
    .setDescription('B2B Lead Generation Platform API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Queen Mama API running on http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/api-docs`);
}

bootstrap();
