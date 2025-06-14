import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export class AuthDto extends createZodDto(AuthSchema) {}
