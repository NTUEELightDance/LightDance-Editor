import { gql } from "@apollo/client";

export const ADD_CONTROL_FRAME = gql`
  mutation AddControlFrame($start: Int!, $fade: Boolean) {
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
  mutation AddPositionFrame($start: Int!) {
    addPositionFrame(start: $start) {
      start
      id
    }
  }
`;

export const EDIT_POS_FRAME = gql`
  mutation EditPosMap($input: EditPositionMapInput!) {
    editPosMap(input: $input) {
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
  mutation DeletePositionFrame($input: DeletePositionFrameInput!) {
    deletePositionFrame(input: $input) {
      start
      id
    }
  }
`;

export const REQUEST_EDIT_CONTROL_BY_ID = gql`
  mutation RequestEditControl($frameId: Int!) {
    RequestEditControl(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const REQUEST_EDIT_POS_BY_ID = gql`
  mutation RequestEditPosition($frameId: Int!) {
    RequestEditPosition(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const CANCEL_EDIT_CONTROL_BY_ID = gql`
  mutation CancelEditControl($frameId: Int!) {
    CancelEditControl(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

export const CANCEL_EDIT_POS_BY_ID = gql`
  mutation CancelEditPosition($frameId: Int!) {
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
  mutation AddEffectList($end: Int!, $start: Int!, $description: String) {
    addEffectList(end: $end, start: $start, description: $description) {
      controlFrames
      positionFrames
      id
      end
      start
      description
    }
  }
`;

export const APPLY_EFFECT_LIST = gql`
  mutation ApplyEffectList($start: Int!, $applyEffectListId: Int!) {
    applyEffectList(start: $start, id: $applyEffectListId) {
      msg
      ok
    }
  }
`;

export const DELETE_EFFECT_LIST = gql`
  mutation DeleteEffectList($deleteEffectListId: Int!) {
    deleteEffectList(id: $deleteEffectListId) {
      ok
      msg
    }
  }
`;

export const ADD_LED_EFFECT = gql`
  mutation AddLEDEffect($input: LEDEffectCreateInput!) {
    addLEDEffect(input: $input) {
      partName
      effectName
      repeat
      ok
      msg
    }
  }
`;

export const EDIT_LED_EFFECT = gql`
  mutation EditLEDEffect($input: EditLEDInput!) {
    editLEDEffect(input: $input) {
      partName
      effectName
      repeat
      effects {
        LEDs
        fade
        start
      }
      ok
      msg
    }
  }
`;

export const DELETE_LED_EFFECT = gql`
  mutation DeleteLEDEffect($input: DeleteLEDInput!) {
    deleteLEDEffect(input: $input) {
      ok
      msg
    }
  }
`;

export const SHIFT_TIME = gql`
  mutation Shift(
    $shiftPosition: Boolean!
    $shiftControl: Boolean!
    $move: Int!
    $end: Int!
    $start: Int!
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
