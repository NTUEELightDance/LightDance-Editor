import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartWhereInput } from "../../../inputs/PartWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyPartArgs {
  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  where?: PartWhereInput | undefined;
}
