import { gql } from "@apollo/client";

export const ADD_CONTROL_FRAME = gql`
  mutation AddControlFrame($start: Float!, $fade: Boolean) {
    addControlFrame(start: $start, fade: $fade) {
      start
      id
    }
  }
`;

export const EDIT_CONTROL_FRAME = gql`
  mutation EditControlMap($input: EditControlMapInput!) {
    editControlMap(input: $input) {
      frameIds
    }
  }
`;

export const EDIT_CONTROL_FRAME_TIME = gql`
  mutation EditControlFrame($input: EditControlFrameInput!) {
    editControlFrame(input: $input) {
      start
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

export const ADD_POS_FRAME = gql`
  mutation AddPositionFrame($start: Float!) {
    addPositionFrame(start: $start) {
      start
      id
    }
  }
`;

export const EDIT_POS_FRAME = gql`
  mutation EditPosMap($start: Float!, $pos: [[Float!]!]!) {
    editPosMap(start: $start, pos: $pos) {
      frameIds
    }
  }
`;

export const EDIT_POS_FRAME_TIME = gql`
  mutation EditPositionFrame($input: EditPositionFrameInput!) {
    editPositionFrame(input: $input) {
      start
      id
    }
  }
`;

export const DELETE_POS_FRAME = gql`
  mutation EditPosMap($input: DeletePositionFrameInput!) {
    deletePositionFrame(input: $input) {
      start
      id
    }
  }
`;

export const REQUEST_EDIT_CONTROL_BY_ID = gql`
  mutation RequestEditControl($frameId: Float!) {
    RequestEditControl(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const REQUEST_EDIT_POS_BY_ID = gql`
  mutation RequestEditPosition($frameId: Float!) {
    RequestEditPosition(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const CANCEL_EDIT_CONTROL_BY_ID = gql`
  mutation CancelEditControl($frameId: Float!) {
    CancelEditControl(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const CANCEL_EDIT_POS_BY_ID = gql`
  mutation CancelEditPosition($frameId: Float!) {
    CancelEditPosition(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const ADD_COLOR = gql`
  mutation AddColor($color: ColorCreateInput!) {
    addColor(color: $color) {
      color
      colorCode
    }
  }
`;

export const EDIT_COLOR = gql`
  mutation EditColorCodeByColor($colorCode: String!, $color: String!) {
    editColorCodeByColor(colorCode: $colorCode, color: $color) {
      color
      colorCode
    }
  }
`;

export const DELETE_COLOR = gql`
  mutation DeleteColor($color: String!) {
    deleteColor(color: $color) {
      ok
    }
  }
`;

export const ADD_EFFECT_LIST = gql`
  mutation AddEffectList($end: Float!, $start: Float!, $description: String) {
    addEffectList(end: $end, start: $start, description: $description) {
      id
    }
  }
`;

export const APPLY_EFFECT_LIST = gql`
  mutation ApplyEffectList(
    $clear: Boolean!
    $start: Float!
    $applyEffectListId: Float!
  ) {
    applyEffectList(clear: $clear, start: $start, id: $applyEffectListId) {
      ok
      msg
    }
  }
`;

export const DELETE_EFFECT_LIST = gql`
  mutation DeleteEffectList($deleteEffectListId: Float!) {
    deleteEffectList(id: $deleteEffectListId) {
      ok
      msg
    }
  }
`;

export const SHIFT_TIME = gql`
  mutation Shift(
    $shiftPosition: Boolean!
    $shiftControl: Boolean!
    $move: Float!
    $end: Float!
    $start: Float!
  ) {
    shift(
      shiftPosition: $shiftPosition
      shiftControl: $shiftControl
      move: $move
      end: $end
      start: $start
    ) {
      ok
      msg
    }
  }
`;
