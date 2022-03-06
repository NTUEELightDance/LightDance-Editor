// gql
import client from "client";
import { GET_LED_MAP } from "graphql";

export const ledAgent = {
  getLedMap: async () => {
    const ledMapData = await client.query({ query: GET_LED_MAP });
    console.log(ledMapData);
    return ledMapData.data.LEDMap.LEDMap;
  },
};
