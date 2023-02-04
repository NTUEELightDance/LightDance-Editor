import { gql } from "@apollo/client";

export const GET_DANCERS = gql`
    query Dancer {
        dancer {
            name
            parts {
                name
                type
            }
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
            data
        }
    }
`;
