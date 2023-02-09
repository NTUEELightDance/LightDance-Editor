import * as TypeGraphQL from "type-graphql";
import { Dancer } from "../../../models/Dancer";
import { Part } from "../../../models/Part";
import { PositionData } from "../../../models/PositionData";
import { DancerPartsArgs } from "./args/DancerPartsArgs";
import { DancerPositionDataArgs } from "./args/DancerPositionDataArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Dancer)
export class DancerRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [Part], {
    nullable: false
  })
  async parts(@TypeGraphQL.Root() dancer: Dancer, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DancerPartsArgs): Promise<Part[]> {
    return getPrismaFromContext(ctx).dancer.findUnique({
      where: {
        id: dancer.id,
      },
    }).parts(args);
  }

  @TypeGraphQL.FieldResolver(_type => [PositionData], {
    nullable: false
  })
  async positionData(@TypeGraphQL.Root() dancer: Dancer, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Args() args: DancerPositionDataArgs): Promise<PositionData[]> {
    return getPrismaFromContext(ctx).dancer.findUnique({
      where: {
        id: dancer.id,
      },
    }).positionData(args);
  }
}
