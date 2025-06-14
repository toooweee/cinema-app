import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientInitializationError
      | Prisma.PrismaClientRustPanicError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const url = `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`;

    console.log(url);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownErrors(exception, res);
    }

    console.log(`Prisma error: ${exception.message}`);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }

  private handleKnownErrors(
    exception: Prisma.PrismaClientKnownRequestError,
    res: Response,
  ) {
    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.target;
        let messageFields: string;

        if (Array.isArray(target)) {
          messageFields = target.join('. ');
        } else if (typeof target === 'string') {
          messageFields = target;
        } else {
          messageFields = 'неизвестные поля';
        }

        return res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `Конфликт: запись с ${messageFields} уже существует`,
        });
      }
      case 'P2003':
        console.log(exception.message);
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Некорректная связь с другой сущностью',
        });
      case 'P2025':
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Запрашиваемая запись не найдена',
        });
      default:
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
    }
  }
}
