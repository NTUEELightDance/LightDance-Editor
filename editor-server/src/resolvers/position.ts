import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";

import { IPosition, TContext } from "../types/global";
import { Position } from "./types/position";

@Resolver((of) => Position)
export class PositionResolver {
  @FieldResolver()
  async frame(@Root() position: IPosition, @Ctx() ctx: TContext) {
    const data = await ctx.db.PositionFrame.findOne({ _id: position.frame });
    return data;
  }
}
