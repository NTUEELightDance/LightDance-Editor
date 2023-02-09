import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { DancerCreateManyInput } from "../../../inputs/DancerCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyDancerArgs {
  @TypeGraphQL.Field(_type => [DancerCreateManyInput], {
    nullable: false
  })
  data!: DancerCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
