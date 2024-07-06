import { z } from 'zod';

export const validateProduct = (inputs: unknown) => ProductSchema.parse(inputs);

export const ProductSchema = z.object({
  title: z.string({
    required_error: 'title is required',
  }),
  description: z.string(),
  price: z.number(),
  count: z.number(),
});
