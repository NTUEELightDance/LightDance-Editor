import { ColorID, RGB } from "@/core/models";
import { gql } from "@apollo/client";

export const SUB_POS_RECORD = gql`
  subscription PositionRecordSubscription {
    positionRecordSubscription {
      mutation
      editBy
      index
      addID
      updateID
      deleteID
    }
  }
`;

export const SUB_POS_MAP = gql`
  subscription PositionMapSubscription {
    positionMapSubscription {
      frame
      editBy
    }
  }
`;

export const SUB_CONTROL_RECORD = gql`
  subscription ControlRecordSubscription {
    controlRecordSubscription {
      mutation
      editBy
      index
      addID
      updateID
      deleteID
    }
  }
`;

export const SUB_CONTROL_MAP = gql`
  subscription ControlMapSubscription {
    controlMapSubscription {
      frame
      editBy
    }
  }
`;

export const SUB_EFFECT_LIST = gql`
  subscription EffectListSubscription {
    effectListSubscription {
      mutation
      effectListID
      editBy
      effectListData {
        start
        end
        description
        id
        controlFrames
        positionFrames
      }
    }
  }
`;

export interface ColorSubscriptionData {
  colorSubscription: {
    id: ColorID;
    color: string;
    colorCode: RGB;
    mutation: "CREATED" | "UPDATED" | "DELETED";
  };
}

export const SUB_COLOR = gql`
  subscription ColorSubscription {
    colorSubscription {
      id
      color
      colorCode
      mutation
    }
  }
`;
