import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma/prisma.service';
import { AuthDto } from '@auth/dto/auth.dto';
import * as argon from 'argon2';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
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

      const hashedPassword = await argon.hash(registerDto.email);

      const user = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });

      return user;
    }

    throw new ConflictException(
      `User with email ${registerDto.email} already exists`,
    );
  }

  async login() {}
}
