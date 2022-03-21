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
    mutation EditControlMap($start: Float!, $controlData: [EditControlInput!]!, $fade: Boolean) {
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
export const REQUEST_EDIT_CONTROL_BY_ID = gql`
    mutation RequestEditControl($frameId: String!) {
        RequestEditControl(FrameID: $frameId) {
            editing
            ok
        }
    }
`;
export const REQUEST_EDIT_POS_BY_ID = gql`
    mutation RequestEditPosition($frameId: String!) {
        RequestEditPosition(FrameID: $frameId) {
            editing
            ok
        }
    }
`;
export const CANCEL_EDIT_CONTROL_BY_ID = gql`
    mutation CancelEditControl($frameId: String!) {
        CancelEditControl(FrameID: $frameId) {
            editing
            ok
        }
    }
`;
export const CANCEL_EDIT_POS_BY_ID = gql`
    mutation CancelEditPosition($frameId: String!) {
        CancelEditPosition(FrameID: $frameId) {
            editing
            ok
        }
    }
`;
export const ADD_COLOR = gql`
    mutation Mutation($color: addColorInput!) {
        addColor(color: $color) {
            color
            colorCode
        }
    }
`;
export const EDIT_COLOR = gql`
    mutation Mutation($color: editColorInput!) {
        editColor(color: $color) {
            color
            colorCode
        }
    }
`;
export const DELETE_COLOR = gql`
    mutation DeleteColor($color: String!) {
        deleteColor(color: $color) {
            color
            colorCode
        }
    }
`;

export const ADD_EFFECT_LIST = gql`
    mutation AddEffecctList($end: Float!, $start: Float!, $description: String) {
        addEffectList(end: $end, start: $start, description: $description) {
            start
            end
            description
            id
            data
        }
    }
`;

export const APPLY_EFFECT_LIST = gql`
    mutation ApplyEffectList($clear: Boolean!, $start: Float!, $applyEffectListId: ID!) {
        applyEffectList(clear: $clear, start: $start, id: $applyEffectListId) {
            ok
            msg
        }
    }
`;

export const DELETE_EFFECT_LIST = gql`
    mutation DeleteEffectList($deleteEffectListId: ID!) {
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
