import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlFrameOrderByWithRelationInput } from "../../../inputs/ControlFrameOrderByWithRelationInput";
import { ControlFrameWhereInput } from "../../../inputs/ControlFrameWhereInput";
import { ControlFrameWhereUniqueInput } from "../../../inputs/ControlFrameWhereUniqueInput";
import { ControlFrameScalarFieldEnum } from "../../../../enums/ControlFrameScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindManyControlFrameArgs {
  @TypeGraphQL.Field(_type => ControlFrameWhereInput, {
    nullable: true
  })
  where?: ControlFrameWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: ControlFrameOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: true
  })
  cursor?: ControlFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ControlFrameScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "start" | "fade"> | undefined;
}
