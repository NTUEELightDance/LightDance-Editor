import {
    Resolver,
    Query,
    FieldResolver,
    Arg,
    Ctx,
    Root,
    Mutation,
    Int,
    ResolverInterface,
} from 'type-graphql';

@Resolver()
class ColorResolver {
    @Query(returns => String)
    async color(@Arg("color") color: string) {
        console.log(color)
    }
}

export default ColorResolver