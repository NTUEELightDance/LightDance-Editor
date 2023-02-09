import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ControlDataOrderByWithRelationInput } from "../../../inputs/ControlDataOrderByWithRelationInput";
import { ControlDataWhereInput } from "../../../inputs/ControlDataWhereInput";
import { ControlDataWhereUniqueInput } from "../../../inputs/ControlDataWhereUniqueInput";
import { ControlDataScalarFieldEnum } from "../../../../enums/ControlDataScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstControlDataOrThrowArgs {
  @TypeGraphQL.Field(_type => ControlDataWhereInput, {
    nullable: true
  })
  where?: ControlDataWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ControlDataOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: ControlDataOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlDataWhereUniqueInput, {
    nullable: true
  })
  cursor?: ControlDataWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"partId" | "frameId" | "value"> | undefined;
}
