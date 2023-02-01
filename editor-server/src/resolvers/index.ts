import { DancerResolver } from "./dancer";
// import ColorResolver from "./color";
// import SubscriptionResolver from "./subscriptions";
import { PartResolver } from "./part";
import { ControlFrameResolver } from "./controlFrame";
// import { PositionFrameResolver } from "./positionFrame";
import { ControlMapResolver, EditControlMapResolver } from "./controlMap";
import { RequestEditResolver } from "./requestEdit";
// import { PositionResolver } from "./position";
// import { PosMapResolver, EditPosMapResolver } from "./positionMap";
// import { EffectListResolver } from "./effectList";
// import { ShiftResolver } from "./shift";
// import { LEDResolver } from "./led";

import { FindManyColorResolver,
  FindUniqueColorResolver ,
  ControlDataRelationsResolver,
  ControlFrameRelationsResolver,
  DancerRelationsResolver ,
  EditingControlFrameRelationsResolver ,
  EditingPositionFrameRelationsResolver ,
  LEDEffectRelationsResolver ,
  LEDFrameRelationsResolver ,
  PartRelationsResolver ,
  PositionDataRelationsResolver ,
  PositionFrameRelationsResolver ,
  UserRelationsResolver
} from "../../prisma/generated/type-graphql";


export const resolvers = [
  // Color related
  // ColorResolver,
  FindManyColorResolver,
  FindUniqueColorResolver,


  DancerResolver,
  PartResolver,
  // PositionResolver,
  // SubscriptionResolver,
  // ControlFrameResolver,
  // PositionFrameResolver,
  ControlMapResolver,
  RequestEditResolver,
  // PosMapResolver,
  // EditControlMapResolver,
  // EditPosMapResolver,
  // EffectListResolver,
  // ShiftResolver,
  // LEDResolver

  ControlDataRelationsResolver,
  ControlFrameRelationsResolver,
  DancerRelationsResolver ,
  EditingControlFrameRelationsResolver ,
  EditingPositionFrameRelationsResolver ,
  LEDEffectRelationsResolver ,
  LEDFrameRelationsResolver ,
  PartRelationsResolver ,
  PositionDataRelationsResolver ,
  PositionFrameRelationsResolver ,
  UserRelationsResolver
] as const;
