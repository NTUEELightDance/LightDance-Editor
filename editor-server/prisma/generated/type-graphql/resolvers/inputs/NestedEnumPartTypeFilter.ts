import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartType } from "../../enums/PartType";

@TypeGraphQL.InputType("NestedEnumPartTypeFilter", {
  isAbstract: true
})
export class NestedEnumPartTypeFilter {
  @TypeGraphQL.Field(_type => PartType, {
    nullable: true
  })
  equals?: "LED" | "FIBER" | undefined;

  @TypeGraphQL.Field(_type => [PartType], {
    nullable: true
  })
  in?: Array<"LED" | "FIBER"> | undefined;

  @TypeGraphQL.Field(_type => [PartType], {
    nullable: true
  })
  notIn?: Array<"LED" | "FIBER"> | undefined;

  @TypeGraphQL.Field(_type => NestedEnumPartTypeFilter, {
    nullable: true
  })
  not?: NestedEnumPartTypeFilter | undefined;
}
