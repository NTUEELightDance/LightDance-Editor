import { DancerResolver, PartResolver, ControlResolver, PositionResolver } from './dancer'
import ColorResolver from './color'

export const resolvers = [
    ColorResolver,
    DancerResolver,
    PartResolver,
    ControlResolver,
    PositionResolver
] as const