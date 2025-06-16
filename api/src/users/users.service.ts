import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@prisma/prisma.service';
import { UserUniqueInput } from '@users/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(where: UserUniqueInput) {
    return this.prisma.user.findUnique({
      where,
    });
  }

  async me(token: string) {
    return this.prisma.user.findFirst({
      where: {
        token,
      },
    });
  }
}
