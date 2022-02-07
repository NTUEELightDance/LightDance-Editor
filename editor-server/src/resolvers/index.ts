import { DancerResolver } from "./dancer";
import ColorResolver from "./color";
import SubscriptionResolver from "./subscriptions";
import { PartResolver } from "./part";
import { ControlFrameResolver } from "./controlFrame";
import { PositionFrameResolver } from "./positionFrame";
import { FiberResolver } from "./fiber";
import { ControlMapResolver, EditControlMapResolver } from "./controlMap";
import { RequestEditResolver } from "./requestEdit";
import { ControlResolver } from "./control";
import { PositionResolver } from "./position";
import { PosMapResolver, EditPosMapResolver } from "./positionMap";

export const resolvers = [
  ColorResolver,
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
] as const;
