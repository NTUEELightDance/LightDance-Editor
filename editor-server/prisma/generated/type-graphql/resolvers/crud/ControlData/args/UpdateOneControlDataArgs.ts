import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataUpdateInput } from "../../../inputs/ControlDataUpdateInput";
import { ControlDataWhereUniqueInput } from "../../../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataUpdateInput, {
    nullable: false
  })
  data!: ControlDataUpdateInput;

  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;
}
