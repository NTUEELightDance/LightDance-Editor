import { gql } from "@apollo/client";

export const ADD_CONTROL_RECORD = gql`
  mutation AddControlFrame($start: Float!) {
    addControlFrame(start: $start) {
      start
      fade
      editing
      id
    }
  }
`;

export const EDIT_CONTROL_MAP_BY_ID = gql`
  mutation EditControlMap(
    $frameId: String!
    $controlDatas: [EditControlInput!]!
  ) {
    editControlMap(frameID: $frameId, controlDatas: $controlDatas) {
      frame
    }
  }
`;

export const EDIT_CONTROL_RECORD_BY_ID = gql`
  mutation EditControlFrame($input: EditControlFrameInput!) {
    editControlFrame(input: $input) {
      start
      fade
      id
    }
  }
`;
