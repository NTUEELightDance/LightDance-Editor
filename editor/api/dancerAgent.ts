import client from "../client";

// gql
import { GET_DANCERS } from "../graphql";

export const dancerAgent = {
  getDancers: async () => {
    const dancerData = await client.query({ query: GET_DANCERS });
    return dancerData.data.dancer;
  },
};
