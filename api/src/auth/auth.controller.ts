import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from '@auth/dto/auth.dto';
import { Response } from 'express';
import * as process from 'node:process';
import { Cookies } from '@common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() registerDto: AuthDto,
  ) {
    const tokens = await this.authService.register(registerDto);
    this.setTokenToCookies(tokens.refreshToken, res);
    return tokens;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: AuthDto,
  ) {
    const tokens = await this.authService.login(loginDto);
    this.setTokenToCookies(tokens.refreshToken, res);
    return tokens;
  }

  @Get('refresh')
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
    @Cookies('REFRESH_TOKEN') token: string,
  ) {
    const tokens = await this.authService.refreshTokens(token);
    this.setTokenToCookies(tokens.refreshToken, res);
    return tokens;
  }

  private setTokenToCookies(token: string, res: Response) {
    res.cookie('REFRESH_TOKEN', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}
