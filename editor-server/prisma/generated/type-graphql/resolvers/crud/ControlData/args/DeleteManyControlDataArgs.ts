import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataWhereInput } from "../../../inputs/ControlDataWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyControlDataArgs {
  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  where?: ControlDataWhereInput | undefined;
}
