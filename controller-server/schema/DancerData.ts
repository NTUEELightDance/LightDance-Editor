import { z } from "zod";

export const MACAddressSchema = z
  .string()
  .regex(/([0-9A-F]{2}:){5}[0-9A-F]{2}/);

export const DancerDataSchema = z.record(
  MACAddressSchema,
  z.object({
    IP: z.string().ip(),
    MAC: MACAddressSchema,
    dancer: z.string(),
    hostname: z.string().regex(/lightdance-[0-9]{2}/),
    connected: z.boolean(),
    interface: z.enum(["wifi", "ethernet"]),
  }),
);

export type MACAddress = z.infer<typeof MACAddressSchema>;
export type DancerData = z.infer<typeof DancerDataSchema>;
