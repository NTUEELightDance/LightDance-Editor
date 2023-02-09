import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataCreateInput } from "../../../inputs/ControlDataCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataCreateInput, {
    nullable: false
  })
  data!: ControlDataCreateInput;
}
