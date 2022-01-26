import { DancerResolver, ControlResolver, PositionResolver } from './dancer'
import ColorResolver from './color'
import SubscriptionResolver from "./subscriptions"
import { PartResolver } from './part'
import { ControlFrameResolver } from './controlFrame'
import { PositionFrameResolver } from './positionFrame'
import { FiberResolver } from './fiber'
import { ControlMapTestResolver } from './types/controlMapTest'

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
    ControlMapTestResolver
] as const