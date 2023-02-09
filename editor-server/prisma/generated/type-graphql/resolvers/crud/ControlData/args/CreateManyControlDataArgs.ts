import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataCreateManyInput } from "../../../inputs/ControlDataCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyControlDataArgs {
  @TypeGraphQL.Field(_type => [ControlDataCreateManyInput], {
    nullable: false
  })
  data!: ControlDataCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
