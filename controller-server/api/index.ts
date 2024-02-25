import { OF, LED, OFSchema, LEDSchema } from "@/schema/global";

import pinMapTable from "@/configs/pinMapTable";

import { instance } from "./axios";

export async function getDancerLEDDataAPI(RPiName: string) {
  const getRPiDataJSON = pinMapTable[RPiName];
  const { data } = await instance.post<LED>("/getDancerLEDData", {
    dancer: getRPiDataJSON.dancer,
    LEDPARTS: getRPiDataJSON.LEDPARTS,
    LEDPARTS_MERGE: getRPiDataJSON.LEDPARTS_MERGE,
  });

  LEDSchema.parse(data);

  return data;
}

export async function getDancerFiberDataAPI(RPiName: string) {
  const getRPiDataJSON = pinMapTable[RPiName];
  const { data } = await instance.post<OF>("/getDancerFiberData", {
    dancer: getRPiDataJSON.dancer,
    OFPARTS: getRPiDataJSON.OFPARTS,
  });

  OFSchema.parse(data);

  return data;
}
