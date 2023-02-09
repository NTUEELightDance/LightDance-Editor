import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PositionFrameCreateManyInput } from "../../../inputs/PositionFrameCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyPositionFrameArgs {
  @TypeGraphQL.Field(_type => [PositionFrameCreateManyInput], {
    nullable: false
  })
  data!: PositionFrameCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
