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
// import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
// import { IPosition, TContext } from "../types/global";
// import { PositionData } from "../../prisma/generated/type-graphql";

// @Resolver((of) => PositionData)
// export class PositionResolver {
//   @FieldResolver(() => PositionData)
//   async frame(@Root() position: IPosition, @Ctx() ctx: TContext) {
//     const data = ctx.prisma.positionFrame.findFirst({
//       where: { id: position.frame },
//     });
//     return data;
//   }
// }
