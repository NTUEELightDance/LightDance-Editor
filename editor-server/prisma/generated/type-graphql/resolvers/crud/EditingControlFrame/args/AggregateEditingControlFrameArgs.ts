import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingControlFrameOrderByWithRelationInput } from "../../../inputs/EditingControlFrameOrderByWithRelationInput";
import { EditingControlFrameWhereInput } from "../../../inputs/EditingControlFrameWhereInput";
import { EditingControlFrameWhereUniqueInput } from "../../../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateEditingControlFrameArgs {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereInput, {
    nullable: true
  })
  where?: EditingControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EditingControlFrameOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: EditingControlFrameOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: true
  })
  cursor?: EditingControlFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
