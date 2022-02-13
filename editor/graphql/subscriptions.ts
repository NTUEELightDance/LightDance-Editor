import { gql } from "@apollo/client";

export const SUB_POS_RECORD = gql`
  subscription PositionRecordSubscription {
    positionRecordSubscription {
      mutation
      frameID
      editBy
      index
    }
  }
`;

export const SUB_POS_MAP = gql`
  subscription PositionMapSubscription {
    positionMapSubscription {
      mutation
      frame
      frameID
      editBy
    }
  }
`;

export const SUB_CONTROL_RECORD = gql`
  subscription ControlRecordSubscription {
    controlRecordSubscription {
      mutation
      frameID
      editBy
      index
    }
  }
`;

export const SUB_CONTROL_MAP = gql`
  subscription ControlMapSubscription {
    controlMapSubscription {
      mutation
      frame
      frameID
      editBy
    }
  }
`;
