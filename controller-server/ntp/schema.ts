import { z } from "zod";

export const TimeDataSchema = z.object({
  t0: z.number(),
  t1: z.number(),
  t2: z.number(),
  t3: z.number(),
});

export const ReceivedTimeDataSchema = z.object({
  t1: z.number(),
  t2: z.number(),
});

export type TimeData = z.infer<typeof TimeDataSchema>;
export type ReceivedTimeData = z.infer<typeof ReceivedTimeDataSchema>;
