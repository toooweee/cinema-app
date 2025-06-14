import { User } from '../../../generated/prisma';

export class JwtPayload {
  sub: string;
  email: string;
  role: string;

  constructor(user: User) {
    this.sub = user.email;
    this.email = user.email;
    this.role = user.role;
  }
}
