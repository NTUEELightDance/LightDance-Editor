import { gql } from "@apollo/client";

export const GET_DANCERS = gql`
  query Dancers($orderBy: [PartOrderByWithRelationInput!]) {
    dancers {
      name
      parts(orderBy: $orderBy) {
        name
        type
        length
      }
    }
  }
`;

export const GET_CONTROL_MAP = gql`
  query controlMap {
    ControlMap {
      frameIds
    }
  }
`;

export const SELECT_CONTROL_FRAMES = gql`
  query ControlMap($select: queryMapInput) {
    ControlMap(select: $select) {
      frameIds
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
      frameIds
    }
  }
`;

export const SELECT_POS_FRAMES = gql`
  query PositionFrame($select: queryMapInput) {
    PosMap(select: $select) {
      frameIds
    }
  }
`;

export const GET_POS_RECORD = gql`
  query posRecord {
    positionFrameIDs
  }
`;

export const GET_COLOR_MAP = gql`
  query ColorMap {
    colorMap {
      colorMap
    }
  }
`;

export const GET_LED_MAP = gql`
  query LEDMap {
    LEDMap {
      LEDMap
    }
  }
`;

export const GET_EFFECT_LIST = gql`
  query EffectList {
    effectList {
      start
      end
      description
      id
      controlFrames
      positionFrames
    }
  }
`;
