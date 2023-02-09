import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PartOrderByWithRelationInput } from "../../../inputs/PartOrderByWithRelationInput";
import { PartWhereInput } from "../../../inputs/PartWhereInput";
import { PartWhereUniqueInput } from "../../../inputs/PartWhereUniqueInput";
import { PartScalarFieldEnum } from "../../../../enums/PartScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class DancerPartsArgs {
  @TypeGraphQL.Field(_type => PartWhereInput, {
    nullable: true
  })
  where?: PartWhereInput | undefined;

  @TypeGraphQL.Field(_type => [PartOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: PartOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: true
  })
  cursor?: PartWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [PartScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "dancerId" | "name" | "type"> | undefined;
}
