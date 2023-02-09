import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorCreateInput } from "../../../inputs/ColorCreateInput";
import { ColorUpdateInput } from "../../../inputs/ColorUpdateInput";
import { ColorWhereUniqueInput } from "../../../inputs/ColorWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneColorArgs {
  @TypeGraphQL.Field(_type => ColorWhereUniqueInput, {
    nullable: false
  })
  where!: ColorWhereUniqueInput;

  @TypeGraphQL.Field(_type => ColorCreateInput, {
    nullable: false
  })
  create!: ColorCreateInput;

  @TypeGraphQL.Field(_type => ColorUpdateInput, {
    nullable: false
  })
  update!: ColorUpdateInput;
}
