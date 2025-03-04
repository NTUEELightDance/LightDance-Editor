import { z } from "zod";

export const ColorSchema = z.tuple([
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
]);

export const OFSchema = z.array(
  z.object({
    start: z.number().int(),
    fade: z.boolean(),
    status: z.record(z.string(), ColorSchema),
  }),
);

export const LEDSchema = z.record(
  z.string(),
  z.array(
    z.object({
      start: z.number().int(),
      fade: z.boolean(),
      status: z.array(ColorSchema),
    }),
  ),
);

export type Color = z.infer<typeof ColorSchema>;
export type OF = z.infer<typeof OFSchema>;
export type LED = z.infer<typeof OFSchema>;
