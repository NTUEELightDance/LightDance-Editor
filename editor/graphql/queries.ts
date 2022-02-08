import { gql } from "@apollo/client";

export const GET_DANCERS = gql`
  query dancers {
    dancer {
      name
      id
    }
  }
`;

export const GET_CONTROL_MAP = gql`
  query controlMap {
    ControlMap {
      frames
    }
  }
`;

export const GET_CONTROL_RECORD = gql`
  query controlRecord {
    controlFrameIDs
  }
`;

export const GET_POS_MAP = gql`
  query posMap {
    PosMap {
      frames
    }
  }
`;

export const GET_POS_RECORD = gql`
  query posRecord {
    positionFrameIDs
  }
`;
