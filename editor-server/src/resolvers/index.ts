import { DancerResolver, PartResolver, ControlResolver, PositionResolver } from './dancer'
import ColorResolver from './color'
import SubscriptionResolver from "./subscriptions"

export const resolvers = [
    ColorResolver,
    DancerResolver,
    PartResolver,
    ControlResolver,
    PositionResolver,
    SubscriptionResolver
] as const