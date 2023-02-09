import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionDataCreateManyInput } from "../../../inputs/PositionDataCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyPositionDataArgs {
  @TypeGraphQL.Field(_type => [PositionDataCreateManyInput], {
    nullable: false
  })
  data!: PositionDataCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
