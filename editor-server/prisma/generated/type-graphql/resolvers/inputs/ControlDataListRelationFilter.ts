import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataWhereInput } from "../inputs/ControlDataWhereInput";

@TypeGraphQL.InputType("ControlDataListRelationFilter", {
  isAbstract: true
})
export class ControlDataListRelationFilter {
  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  every?: ControlDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  some?: ControlDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  none?: ControlDataWhereInput | undefined;
}
