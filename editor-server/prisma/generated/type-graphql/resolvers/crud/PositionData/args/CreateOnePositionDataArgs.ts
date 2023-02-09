import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataCreateInput } from "../../../inputs/PositionDataCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOnePositionDataArgs {
  @TypeGraphQL.Field(_type => PositionDataCreateInput, {
    nullable: false
  })
  data!: PositionDataCreateInput;
}
