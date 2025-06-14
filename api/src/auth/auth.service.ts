import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma/prisma.service';
import { AuthDto } from '@auth/dto/auth.dto';
import * as argon from 'argon2';
import { Prisma } from 'generated/prisma';
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
    try {
      await this.usersService.findOne({
        email: registerDto.email,
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }

      const hashedPassword = await argon.hash(registerDto.password);

      const user = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });

      const payload = new JwtPayload(user);
      const tokens = await this.tokensService.generateTokens({ ...payload });
      await this.tokensService.saveRefreshToken(tokens.refreshToken, user.id);
      return tokens;
    }

    throw new ConflictException(
      `User with email ${registerDto.email} already exists`,
    );
  }

  async login(registerDto: AuthDto) {
    const { email, password } = registerDto;

    const user = await this.usersService.findOne({
      email,
    });

    if (!(await this.comparePassword(user.password, password))) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload = new JwtPayload(user);
    const tokens = await this.tokensService.generateTokens({ ...payload });
    await this.tokensService.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async refreshTokens(token: string) {
    return await this.tokensService.refreshTokens(token);
  }

  private async comparePassword(hashedPassword: string, password: string) {
    return await argon.verify(hashedPassword, password);
  }
}
