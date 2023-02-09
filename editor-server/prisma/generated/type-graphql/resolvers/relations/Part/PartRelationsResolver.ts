import * as TypeGraphQL from "type-graphql";
import { ControlData } from "../../../models/ControlData";
import { Dancer } from "../../../models/Dancer";
import { Part } from "../../../models/Part";
import { PartControlDataArgs } from "./args/PartControlDataArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Part)
export class PartRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Dancer, {
    nullable: false
  })
  async dancer(@TypeGraphQL.Root() part: Part, @TypeGraphQL.Ctx() ctx: any): Promise<Dancer> {
    return getPrismaFromContext(ctx).part.findUnique({
      where: {
        id: part.id,
      },
    }).dancer({});
  }

  @TypeGraphQL.FieldResolver(_type => [ControlData], {
    nullable: false
  })
  async controlData(@TypeGraphQL.Root() part: Part, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: PartControlDataArgs): Promise<ControlData[]> {
    return getPrismaFromContext(ctx).part.findUnique({
      where: {
        id: part.id,
      },
    }).controlData(args);
  }
}
