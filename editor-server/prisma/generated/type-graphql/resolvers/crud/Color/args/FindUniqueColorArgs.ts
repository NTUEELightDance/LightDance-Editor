import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorWhereUniqueInput } from "../../../inputs/ColorWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueColorArgs {
  @TypeGraphQL.Field(_type => ColorWhereUniqueInput, {
    nullable: false
  })
  where!: ColorWhereUniqueInput;
}
