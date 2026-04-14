import z from "zod";

export const productSchema = z.object({
  name: z.string().min(5).max(50).trim(),
  price: z.number().positive(),
  description: z.string().min(5).max(50),
  stock: z.number().min(0).int(),
  imageUrl: z.url(),
});
