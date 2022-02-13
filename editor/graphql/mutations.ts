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

export const ADD_OR_EDIT_CONTROL_FRAME = gql`
  mutation EditControlMap(
    $start: Float!
    $controlData: [EditControlInput!]!
    $fade: Boolean
  ) {
    editControlMap(start: $start, controlData: $controlData, fade: $fade) {
      frame
    }
  }
`;

export const EDIT_CONTROL_RECORD_BY_ID = gql`
  mutation EditControlFrame($input: EditControlFrameInput!) {
    editControlFrame(input: $input) {
      start
      fade
      editing
      id
    }
  }
`;

export const DELETE_CONTROL_FRAME_BY_ID = gql`
  mutation DeleteControlFrame($input: DeleteControlFrameInput!) {
    deleteControlFrame(input: $input) {
      id
    }
  }
`;

export const ADD_OR_EDIT_POS_FRAME = gql`
  mutation EditPosMap($start: Float!, $positionData: [EditPositionInput!]!) {
    editPosMap(start: $start, positionData: $positionData) {
      frames
    }
  }
`;

export const DELETE_POS_FRAME = gql`
  mutation DeletePositionFrame($input: DeletePositionFrameInput!) {
    deletePositionFrame(input: $input) {
      start
      editing
      id
    }
  }
`;

export const EDIT_POS_FRAME_TIME = gql`
  mutation EditPositionFrame($input: EditPositionFrameInput!) {
    editPositionFrame(input: $input) {
      start
      editing
      id
    }
  }
`;
