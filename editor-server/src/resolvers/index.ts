import { DancerResolver } from "./dancer";
import ColorResolver from "./color";
import SubscriptionResolver from "./subscriptions";
import { PartResolver } from "./part";
import { ControlFrameResolver } from "./controlFrame";
import { PositionFrameResolver } from "./positionFrame";
import { FiberResolver } from "./fiber";
import { ControlMapResolver } from "./controlMap";
import { RequestEditResolver } from "./requestEdit";
import { ControlResolver } from "./control";
import { PositionResolver } from "./position";
import { PosMapResolver } from "./positionMap";

export const resolvers = [
  ColorResolver,
  DancerResolver,
  PartResolver,
  ControlResolver,
  PositionResolver,
  SubscriptionResolver,
  ControlFrameResolver,
  PositionFrameResolver,
  FiberResolver,
  ControlMapResolver,
  RequestEditResolver,
  PosMapResolver,
] as const;
