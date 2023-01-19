import { DancerResolver } from "./dancer";
import ColorResolver from "./color";
import SubscriptionResolver from "./subscriptions";
import { PartResolver } from "./part";
import { ControlFrameResolver } from "./controlFrame";
import { PositionFrameResolver } from "./positionFrame";
import { ControlMapResolver, EditControlMapResolver } from "./controlMap";
import { RequestEditResolver } from "./requestEdit";
import { ControlResolver } from "./control";
import { PositionResolver } from "./position";
import { PosMapResolver, EditPosMapResolver } from "./positionMap";
import { EffectListResolver } from "./effectList";
import { ShiftResolver } from "./shift";
import { LEDResolver } from "./led";

import { FindManyColorResolver, FindUniqueColorResolver } from "../../prisma/generated/type-graphql";

export const resolvers = [
  // Color related
  ColorResolver,
  FindManyColorResolver,
  FindUniqueColorResolver,


  DancerResolver,
  PartResolver,
  ControlResolver,
  PositionResolver,
  SubscriptionResolver,
  ControlFrameResolver,
  PositionFrameResolver,
  ControlMapResolver,
  RequestEditResolver,
  PosMapResolver,
  EditControlMapResolver,
  EditPosMapResolver,
  EffectListResolver,
  ShiftResolver,
  LEDResolver
] as const;
