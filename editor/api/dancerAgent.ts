import client from "../client";

// gql
import { GET_DANCERS } from "../graphql";

import type { DancersPayload } from "@/core/models";

export const dancerAgent = {
  getDancers: async () => {
    try {
      const { data: dancerData } = await client.query({
        query: GET_DANCERS,
        variables: {
          orderBy: [
            {
              id: "asc",
            },
          ],
        },
      });

      return dancerData.dancers as DancersPayload;
    } catch (e) {
      console.error(e);
    }
  },
};
