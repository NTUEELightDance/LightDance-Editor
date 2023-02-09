import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerWhereInput } from "../inputs/DancerWhereInput";

@TypeGraphQL.InputType("DancerRelationFilter", {
  isAbstract: true
})
export class DancerRelationFilter {
  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  is?: DancerWhereInput | undefined;

  @TypeGraphQL.Field(_type => DancerWhereInput, {
    nullable: true
  })
  isNot?: DancerWhereInput | undefined;
}
