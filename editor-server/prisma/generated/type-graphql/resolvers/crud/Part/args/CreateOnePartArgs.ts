import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartCreateInput } from "../../../inputs/PartCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOnePartArgs {
  @TypeGraphQL.Field(_type => PartCreateInput, {
    nullable: false
  })
  data!: PartCreateInput;
}
