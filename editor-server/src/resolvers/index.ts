import { DancerResolver, ControlResolver, PositionResolver } from './dancer'
import ColorResolver from './color'
import SubscriptionResolver from "./subscriptions"
import { PartResolver } from './part'
import { ControlFrameResolver } from './controlFrame'
import { PositionFrameResolver } from './positionFrame'
import { FiberResolver } from './fiber'
import { ControlMapResolver } from './controlMap'

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
    ControlMapResolver
] as const
