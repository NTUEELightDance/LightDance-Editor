import { DancerResolver, ControlResolver, PositionResolver } from './dancer'
import ColorResolver from './color'
import SubscriptionResolver from "./subscriptions"
import { PartResolver } from './part'

export const resolvers = [
    ColorResolver,
    DancerResolver,
    PartResolver,
    ControlResolver,
    PositionResolver,
    SubscriptionResolver
] as const