import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataCreateInput } from "../../../inputs/ControlDataCreateInput";
import { ControlDataUpdateInput } from "../../../inputs/ControlDataUpdateInput";
import { ControlDataWhereUniqueInput } from "../../../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: false
  })
  where!: ControlDataWhereUniqueInput;

  @TypeGraphQL.Field(_type => ControlDataCreateInput, {
    nullable: false
  })
  create!: ControlDataCreateInput;

  @TypeGraphQL.Field(_type => ControlDataUpdateInput, {
    nullable: false
  })
  update!: ControlDataUpdateInput;
}
