import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartWhereInput } from "../inputs/PartWhereInput";

@TypeGraphQL.InputType("PartListRelationFilter", {
  isAbstract: true
})
export class PartListRelationFilter {
  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  every?: PartWhereInput | undefined;

  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  some?: PartWhereInput | undefined;

  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  none?: PartWhereInput | undefined;
}
