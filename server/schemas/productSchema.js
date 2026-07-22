import z from 'zod';

export const productSchema = z.object({
  name: z.string().min(5).max(1000).trim(),
  price: z.number().positive(),
  description: z.string().min(5).max(1000),
  category: z.string().min(2).max(100).trim(),
  stock: z.number().min(0).int(),
  imageUrl: z.url(),
});
