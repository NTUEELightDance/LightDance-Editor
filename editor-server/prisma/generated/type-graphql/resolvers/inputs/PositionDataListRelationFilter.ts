import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataWhereInput } from "../inputs/PositionDataWhereInput";

@TypeGraphQL.InputType("PositionDataListRelationFilter", {
  isAbstract: true
})
export class PositionDataListRelationFilter {
  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  every?: PositionDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  some?: PositionDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => PositionDataWhereInput, {
    nullable: true
  })
  none?: PositionDataWhereInput | undefined;
}
