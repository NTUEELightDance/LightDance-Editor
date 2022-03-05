import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { Position } from "./types/position";

@Resolver((of) => Position)
export class PositionResolver {
  @FieldResolver()
  async frame(@Root() position: any, @Ctx() ctx: any) {
    let data = await ctx.db.PositionFrame.findOne({ _id: position.frame });
    return data;
  }
}
