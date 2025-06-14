import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from '@common/exception-filters';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.setGlobalPrefix('api');
  // patchNestJsSwagger();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
