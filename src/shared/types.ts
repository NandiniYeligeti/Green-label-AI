import z from "zod";

/**
 * Types shared between the client and server go here.
 */

export const ProductSchema = z.object({
  id: z.number().optional(),
  barcode: z.string(),
  name: z.string().nullable(),
  brand: z.string().nullable(),
  image_url: z.string().nullable(),
  green_score: z.number().nullable(),
  nutrition_grade: z.string().nullable(),
  ecoscore_grade: z.string().nullable(),
  packaging_info: z.string().nullable(),
  ingredients_text: z.string().nullable(),
  source: z.enum(["openfoodfacts", "gpt4"]),
  raw_data: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const BarcodeRequestSchema = z.object({
  barcode: z.string().min(8, "Barcode must be at least 8 digits"),
});

export type BarcodeRequestType = z.infer<typeof BarcodeRequestSchema>;

export const ProductResponseSchema = z.object({
  success: z.boolean(),
  product: ProductSchema.optional(),
  message: z.string().optional(),
});

export type ProductResponseType = z.infer<typeof ProductResponseSchema>;
