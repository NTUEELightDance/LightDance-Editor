import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("ColorWhereInput", {
  isAbstract: true
})
export class ColorWhereInput {
  @TypeGraphQL.Field(_type => [ColorWhereInput], {
    nullable: true
  })
  AND?: ColorWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ColorWhereInput], {
    nullable: true
  })
  OR?: ColorWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ColorWhereInput], {
    nullable: true
  })
  NOT?: ColorWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  color?: StringFilter | undefined;

  @TypeGraphQL.Field(_type => StringFilter, {
    nullable: true
  })
  colorCode?: StringFilter | undefined;
}
