import { DancerResolver, PartResolver, ControlResolver } from './dancer'
import ColorResolver from './color'

export const resolvers = [
    ColorResolver, 
    DancerResolver, 
    PartResolver, 
    ControlResolver
] as const