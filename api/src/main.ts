import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from '@common/exception-filters';
import * as cookieParser from 'cookie-parser';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // patchNestJsSwagger();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
