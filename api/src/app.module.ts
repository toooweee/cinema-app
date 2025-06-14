import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@users/users.module';
import { TokensModule } from '@tokens/tokens.module';
import { AuthModule } from '@auth/auth.module';
import { PrismaModule } from '@prisma/prisma.module';
import * as Joi from 'joi';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
      }),
      envFilePath: '.env',
      isGlobal: true,
    }),
    UsersModule,
    TokensModule,
    AuthModule,
    PrismaModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
