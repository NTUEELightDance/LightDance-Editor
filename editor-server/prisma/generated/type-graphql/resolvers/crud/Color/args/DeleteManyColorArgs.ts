import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorWhereInput } from "../../../inputs/ColorWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyColorArgs {
  @TypeGraphQL.Field(_type => ColorWhereInput, {
    nullable: true
  })
  where?: ColorWhereInput | undefined;
}
