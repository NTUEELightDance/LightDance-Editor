import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartCreateManyInput } from "../../../inputs/PartCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyPartArgs {
  @TypeGraphQL.Field(_type => [PartCreateManyInput], {
    nullable: false
  })
  data!: PartCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
