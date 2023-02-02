import { Resolver, FieldResolver, Root, Ctx, Query } from "type-graphql";
import { IPosition, TContext } from "../types/global";
import { PositionData } from "../../prisma/generated/type-graphql";

@Resolver((of) => PositionData)
export class PositionResolver {
  @FieldResolver(() => PositionData)
  async frame(@Root() position: IPosition, @Ctx() ctx: TContext) {
    const data = ctx.prisma.positionFrame.findFirst({
      where: { id: position.frame },
    });
    return data;
  }
}
