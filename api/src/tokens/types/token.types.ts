import { User } from '../../../generated/prisma';

export class JwtPayload {
  sub: string;
  email: string;
  role: string;

  constructor(user: User, payload?: JwtVerifyPayload) {
    if (!payload) {
      this.sub = user.id;
      this.email = user.email;
      this.role = user.role;
    } else {
      this.sub = payload.sub;
      this.email = payload.email;
      this.role = payload.role;
    }
  }
}

export type JwtVerifyPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};
