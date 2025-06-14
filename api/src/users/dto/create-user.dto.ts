import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  roleId: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
