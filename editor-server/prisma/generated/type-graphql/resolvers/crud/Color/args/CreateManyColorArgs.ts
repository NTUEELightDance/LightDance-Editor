import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorCreateManyInput } from "../../../inputs/ColorCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyColorArgs {
  @TypeGraphQL.Field(_type => [ColorCreateManyInput], {
    nullable: false
  })
  data!: ColorCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
