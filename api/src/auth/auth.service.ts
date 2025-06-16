import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma/prisma.service';
import { AuthDto } from '@auth/dto/auth.dto';
import * as argon from 'argon2';
import { JwtPayload } from '@tokens/types';
import { TokensService } from '@tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async register(registerDto: AuthDto) {
    const { email, password } = registerDto;
    const existingUser = await this.usersService.findOne({ email });

    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const hashedPassword = await argon.hash(password);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.tokensService.generateTokens(payload);
    await this.tokensService.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async login(registerDto: AuthDto) {
    const { email, password } = registerDto;

    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (!(await this.comparePassword(user.password, password))) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = await this.tokensService.generateTokens({ ...payload });
    await this.tokensService.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async refreshTokens(token: string) {
    return await this.tokensService.refreshTokens(token);
  }

  async logout(token: string) {
    if (!token) {
      return HttpStatus.OK;
    }

    return this.prisma.token.delete({
      where: {
        token,
      },
    });
  }

  private async comparePassword(hashedPassword: string, password: string) {
    return await argon.verify(hashedPassword, password);
  }
}
