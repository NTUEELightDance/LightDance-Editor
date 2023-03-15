import { OF, LED, OFSchema, LEDSchema } from "@/schema/global";

import { instance } from "./axios";

export async function getDancerLEDDataAPI(dancer: string) {
  const { data } = await instance.get<LED>("/getDancerLEDData", {
    params: { dancer },
  });

  LEDSchema.parse(data);

  return data;
}

export async function getDancerFiberDataAPI(dancer: string) {
  const { data } = await instance.get<OF>("/getDancerFiberData", {
    params: { dancer },
  });

  OFSchema.parse(data);

  return data;
}
