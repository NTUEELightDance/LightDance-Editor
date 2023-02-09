import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartWhereInput } from "../inputs/PartWhereInput";

@TypeGraphQL.InputType("PartRelationFilter", {
  isAbstract: true
})
export class PartRelationFilter {
  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  is?: PartWhereInput | undefined;

  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  isNot?: PartWhereInput | undefined;
}
