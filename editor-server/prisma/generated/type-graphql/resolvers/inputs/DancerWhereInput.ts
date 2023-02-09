import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFilter } from "../inputs/IntFilter";
import { PartListRelationFilter } from "../inputs/PartListRelationFilter";
import { PositionDataListRelationFilter } from "../inputs/PositionDataListRelationFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("DancerWhereInput", {
  isAbstract: true
})
export class DancerWhereInput {
  @TypeGraphQL.Field(_type => [DancerWhereInput], {
    nullable: true
  })
  AND?: DancerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [DancerWhereInput], {
    nullable: true
  })
  OR?: DancerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [DancerWhereInput], {
    nullable: true
  })
  NOT?: DancerWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => PartListRelationFilter, {
    nullable: true
  })
  parts?: PartListRelationFilter | undefined;

  @TypeGraphQL.Field(_type => PositionDataListRelationFilter, {
    nullable: true
  })
  positionData?: PositionDataListRelationFilter | undefined;
}
