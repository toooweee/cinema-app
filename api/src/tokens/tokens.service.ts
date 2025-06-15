import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtVerifyPayload } from '@tokens/types';

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload) {
    const [accessTokenSecret, refreshTokenSecret] = await Promise.all([
      this.configService.get<string>('JWT_AT_SECRET'),
      this.configService.get<string>('JWT_RT_SECRET'),
    ]);

    const [accessTokenExpires, refreshTokenExpires] = await Promise.all([
      this.configService.get<string>('JWT_AT_EXPIRES_IN'),
      this.configService.get<string>('JWT_RT_EXPIRES_IN'),
    ]);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpires,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(token: string, userId: string) {
    return this.prisma.token.upsert({
      create: {
        token,
        userId,
      },
      update: {
        token,
      },
      where: {
        userId,
      },
    });
  }

  async refreshTokens(token: string) {
    await this.findRefreshToken(token);

    const payload = await this.validateRefreshToken(token);

    if (!payload) {
      throw new ForbiddenException();
    }

    const { sub, email, role } = payload;

    const tokens = await this.generateTokens({ sub, email, role });

    await this.saveRefreshToken(tokens.refreshToken, payload.sub);

    return tokens;
  }

  async findRefreshToken(token: string) {
    return this.prisma.token.findUniqueOrThrow({
      where: {
        token,
      },
    });
  }

  private async validateRefreshToken(token: string): Promise<JwtVerifyPayload> {
    return await this.jwtService.verifyAsync<JwtVerifyPayload>(token, {
      secret: this.configService.get<string>('JWT_RT_SECRET'),
    });
  }
}
