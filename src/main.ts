import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const jwtSecret = configService.get<string>('jwt.secret');
  const databaseUrl = configService.get<string>('database.url');

  if (!jwtSecret || !databaseUrl) {
    throw new Error(
      'Missing required environment variables: JWT_SECRET and DATABASE_URL must be set.',
    );
  }

  const port = configService.get<number>('port', 3000);
  const nodeEnv = configService.get<string>('nodeEnv');

  app.use(helmet({ contentSecurityPolicy: nodeEnv === 'production' }));

  app.enableCors({
    origin: configService.get<string>('cors.origin', '*'),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Agurkha API')
      .setDescription('Production-ready NestJS REST API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}/api/v1`);

  if (nodeEnv !== 'production') {
    logger.log(`Swagger docs available at http://localhost:${port}/docs`);
  }
}

bootstrap();
