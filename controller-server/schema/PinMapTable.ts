import { z } from "zod";

export const PinMapSchema = z.object({
  dancer: z.string(),
  fps: z.number(),
  OFPARTS: z.record(z.string(), z.number()),
  LEDPARTS: z.record(
    z.string(),
    z.object({
      id: z.number(),
      len: z.number(),
    }),
  ),
  LEDPARTS_MERGE: z.record(z.array(z.string())),
});

const ModelPinMapSchema = z.object({
  fps: z.number(),
  OFPARTS: z.record(z.string(), z.number()),
  LEDPARTS: z.record(
    z.string(),
    z.object({
      id: z.number(),
      len: z.number(),
    }),
  ),
  LEDPARTS_MERGE: z.record(z.string(), z.array(z.string())),
});

export const PinMapTableSchema = z.record(z.string(), PinMapSchema);
export const ModelPinMapTableSchema = z.record(z.string(), ModelPinMapSchema);

export type PinMap = z.infer<typeof PinMapSchema>;
export type PinMapTable = z.infer<typeof PinMapTableSchema>;
export type ModelPinMapTable = z.infer<typeof ModelPinMapTableSchema>;
