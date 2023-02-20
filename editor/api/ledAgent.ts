// gql
import client from "client";
import { GET_LED_MAP } from "graphql";
import type { LEDMapPayload } from "@/core/models";

export const ledAgent = {
  getLedMapPayload: async () => {
    const ledMapData = await client.query({ query: GET_LED_MAP });
    return ledMapData.data.LEDMap.LEDMap as LEDMapPayload;
  },
};
