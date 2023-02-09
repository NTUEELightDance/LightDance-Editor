import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EditingPositionFrameOrderByWithRelationInput } from "../../../inputs/EditingPositionFrameOrderByWithRelationInput";
import { EditingPositionFrameWhereInput } from "../../../inputs/EditingPositionFrameWhereInput";
import { EditingPositionFrameWhereUniqueInput } from "../../../inputs/EditingPositionFrameWhereUniqueInput";
import { EditingPositionFrameScalarFieldEnum } from "../../../../enums/EditingPositionFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstEditingPositionFrameOrThrowArgs {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereInput, {
    nullable: true
  })
  where?: EditingPositionFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: EditingPositionFrameOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: true
  })
  cursor?: EditingPositionFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [EditingPositionFrameScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"userId" | "frameId"> | undefined;
}
