import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ColorOrderByWithRelationInput } from "../../../inputs/ColorOrderByWithRelationInput";
import { ColorWhereInput } from "../../../inputs/ColorWhereInput";
import { ColorWhereUniqueInput } from "../../../inputs/ColorWhereUniqueInput";
import { ColorScalarFieldEnum } from "../../../../enums/ColorScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstColorArgs {
  @TypeGraphQL.Field(_type => ColorWhereInput, {
    nullable: true
  })
  where?: ColorWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ColorOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: ColorOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => ColorWhereUniqueInput, {
    nullable: true
  })
  cursor?: ColorWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ColorScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"color" | "colorCode"> | undefined;
}
