import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedEnumPartTypeFilter } from "../inputs/NestedEnumPartTypeFilter";
import { NestedIntFilter } from "../inputs/NestedIntFilter";
import { PartType } from "../../enums/PartType";

@TypeGraphQL.InputType("NestedEnumPartTypeWithAggregatesFilter", {
  isAbstract: true
})
export class NestedEnumPartTypeWithAggregatesFilter {
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

  @TypeGraphQL.Field(_type => NestedEnumPartTypeWithAggregatesFilter, {
    nullable: true
  })
  not?: NestedEnumPartTypeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => NestedIntFilter, {
    nullable: true
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumPartTypeFilter, {
    nullable: true
  })
  _min?: NestedEnumPartTypeFilter | undefined;

  @TypeGraphQL.Field(_type => NestedEnumPartTypeFilter, {
    nullable: true
  })
  _max?: NestedEnumPartTypeFilter | undefined;
}
