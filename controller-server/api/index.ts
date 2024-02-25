import { OF, LED, OFSchema, LEDSchema } from "@/schema/global";

import pinMapTable from "@/configs/pinMapTable";

import { instance } from "./axios";

export async function getDancerLEDDataAPI(RPiName: string) {
  const getRPiDataJSON = pinMapTable[RPiName];
  const { data } = await instance.get<LED>("/getDancerLEDData", {
    params: { getRPiDataJSON },
  });

  LEDSchema.parse(data);

  return data;
}

export async function getDancerFiberDataAPI(RPiName: string) {
  const getRPiDataJSON = pinMapTable[RPiName];
  const { data } = await instance.get<OF>("/getDancerFiberData", {
    params: { getRPiDataJSON },
  });

  OFSchema.parse(data);

  return data;
}
