import { gql } from "@apollo/client";

export const GET_DANCERS = gql`
  query Dancer {
    dancer {
      name
      id
    }
  }
`;
