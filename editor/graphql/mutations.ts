import {
  ControlMapStatusMutationPayload,
  LEDEffectID,
  LEDEffectFramePayload,
  LEDPartName,
} from "@/core/models";
import { gql } from "@apollo/client";

export interface AddControlFrameMutationResponseData {
  addControlFrame: {
    id: number;
  };
}

export interface AddControlFrameMutationVariables {
  start: number;
  fade?: boolean;
  controlData?: ControlMapStatusMutationPayload;
}

export const ADD_CONTROL_FRAME = gql`
  mutation AddControlFrame(
    $start: Int!
    $fade: Boolean
    $controlData: [[[Int!]!]!]
  ) {
    addControlFrame(start: $start, fade: $fade, controlData: $controlData) {
      id
    }
  }
`;

export interface EditControlFrameMutationResponseData {
  editControlMap: string;
}

export interface EditControlFrameMutationVariables {
  input: {
    frameId: number;
    fade?: boolean;
    controlData: ControlMapStatusMutationPayload;
  };
}

export const EDIT_CONTROL_FRAME = gql`
  mutation Mutation($input: EditControlMapInput!) {
    editControlMap(input: $input)
  }
`;

export interface EditControlFrameTimeMutationResponseData {
  editControlFrame: {
    id: number;
  };
}

export interface EditControlFrameTimeMutationVariables {
  input: {
    frameId: number;
    start: number;
  };
}

export const EDIT_CONTROL_FRAME_TIME = gql`
  mutation EditControlFrame($input: EditControlFrameInput!) {
    editControlFrame(input: $input) {
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
  mutation AddPositionFrame($start: Int!, $positionData: [[Float!]!]) {
    addPositionFrame(start: $start, positionData: $positionData) {
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

export interface AddColorMutationVariables {
  color: {
    // color name
    color: string;
    // color rgb
    colorCode: {
      set: [number, number, number];
    };
  };
}

export interface AddColorMutationResponseData {
  addColor: {
    id: number;
  };
}

export interface AddColorMutationResponseData {
  addColor: {
    id: number;
  };
}

export interface AddColorMutationVariables {
  color: {
    // color name
    color: string;
    colorCode: {
      // rgb
      set: [number, number, number];
    };
  };
}

export const ADD_COLOR = gql`
  mutation AddColor($color: ColorCreateInput!) {
    addColor(color: $color) {
      id
    }
  }
`;

export interface EditColorMutationVariables {
  data: {
    // color name
    color: {
      set: string;
    };
    // color rgb
    colorCode: {
      set: [number, number, number];
    };
  };
  editColorId: number;
}

export interface EditColorMutationResponseData {
  editColor: {
    id: number;
  };
}

export const EDIT_COLOR = gql`
  mutation EditColor($data: ColorUpdateInput!, $editColorId: Int!) {
    editColor(data: $data, id: $editColorId) {
      id
    }
  }
`;

export interface DeleteColorMutationVariables {
  deleteColorId: number;
}

export interface DeleteColorMutationResponseData {
  deleteColor: {
    ok: boolean;
    msg: string;
  };
}

export const DELETE_COLOR = gql`
  mutation DeleteColor($deleteColorId: Int!) {
    deleteColor(id: $deleteColorId) {
      ok
      msg
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

export interface AddLEDEffectMutationResponseData {
  addLEDEffect: {
    ok: boolean;
    msg: string;
  };
}

export interface AddLEDEffectMutationVariables {
  input: {
    frames: {
      set: LEDEffectFramePayload[];
    };
    name: string;
    partName: LEDPartName;
    repeat: number;
  };
}

export const ADD_LED_EFFECT = gql`
  mutation Mutation($input: LEDEffectCreateInput!) {
    addLEDEffect(input: $input) {
      ok
      msg
    }
  }
`;

export interface EditLEDEffectMutationResponseData {
  editLEDEffect: {
    ok: boolean;
    msg: string;
  };
}

export interface EditLEDEffectMutationVariables {
  input: {
    id: LEDEffectID;
    name: string;
    repeat: number;
    frames: {
      set: LEDEffectFramePayload[];
    };
  };
}

export const EDIT_LED_EFFECT = gql`
  mutation EditLEDEffect($input: EditLEDInput!) {
    editLEDEffect(input: $input) {
      ok
      msg
    }
  }
`;

export interface DeleteLEDEffectMutationResponseData {
  deleteLEDEffect: {
    ok: boolean;
    msg: string;
  };
}

export interface DeleteLEDEffectMutationVariables {
  deleteLedEffectId: LEDEffectID;
}

export const DELETE_LED_EFFECT = gql`
  mutation DeleteLEDEffect($deleteLedEffectId: Int!) {
    deleteLEDEffect(id: $deleteLedEffectId) {
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
