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
    })
  ),
  LEDPARTS_MERGE: z.record(z.array(z.string())),
});

export const PinMapTableSchema = z.record(z.string(), PinMapSchema);

export type PinMap = z.infer<typeof PinMapSchema>;
export type PinMapTable = z.infer<typeof PinMapTableSchema>;
