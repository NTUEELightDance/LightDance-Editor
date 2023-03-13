import { instance } from "./axios";

import { OF, LED, OFSchema, LEDSchema } from "../types/schema/global";

export async function getDancerLEDDataAPI(dancer: string) {
  const { data }: { data: LED } = await instance.get("/getDancerLEDData", {
    params: { dancer },
  });

  const result = LEDSchema.safeParse(data);
  if (!result.success) {
    console.error(`[getDancerLEDDataAPI]: ${result.error}`);
    return;
  }

  return data;
}

export async function getDancerFiberDataAPI(dancer: string) {
  const { data }: { data: OF } = await instance.get("/getDancerFiberData", {
    params: { dancer },
  });

  const result = OFSchema.safeParse(data);
  if (!result.success) {
    console.error(`[getDancerFiberDataAPI]: ${result.error}`);
    return;
  }

  return data;
}
