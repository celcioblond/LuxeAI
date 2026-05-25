import z from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(30),
  email: z.email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
    ),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.email().optional(),
  role: z.enum(['user', 'admin']).optional(),
  address: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    })
    .partial()
    .optional(),
});
