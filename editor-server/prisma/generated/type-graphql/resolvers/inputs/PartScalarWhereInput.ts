import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EnumPartTypeFilter } from "../inputs/EnumPartTypeFilter";
import { IntFilter } from "../inputs/IntFilter";
import { StringFilter } from "../inputs/StringFilter";

@TypeGraphQL.InputType("PartScalarWhereInput", {
  isAbstract: true
})
export class PartScalarWhereInput {
  @TypeGraphQL.Field(_type => [PartScalarWhereInput], {
    nullable: true
  })
  AND?: PartScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarWhereInput], {
    nullable: true
  })
  OR?: PartScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [PartScalarWhereInput], {
    nullable: true
  })
  NOT?: PartScalarWhereInput[] | undefined;

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
}
