import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataListRelationFilter } from "../inputs/ControlDataListRelationFilter";
import { DancerRelationFilter } from "../inputs/DancerRelationFilter";
import { EnumPartTypeFilter } from "../inputs/EnumPartTypeFilter";
import { IntFilter } from "../inputs/IntFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("PartWhereInput", {
  isAbstract: true
})
export class PartWhereInput {
  @TypeGraphQL.Field(_type => [PartWhereInput], {
    nullable: true
  })
  AND?: PartWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartWhereInput], {
    nullable: true
  })
  OR?: PartWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartWhereInput], {
    nullable: true
  })
  NOT?: PartWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  dancerId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => EnumPartTypeFilter, {
    nullable: true
  })
  type?: EnumPartTypeFilter | undefined;

  @TypeGraphQL.Field(_type => DancerRelationFilter, {
    nullable: true
  })
  dancer?: DancerRelationFilter | undefined;

  @TypeGraphQL.Field(_type => ControlDataListRelationFilter, {
    nullable: true
  })
  controlData?: ControlDataListRelationFilter | undefined;
}
