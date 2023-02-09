import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateOrConnectWithoutPositionDatasInput } from "../inputs/PositionFrameCreateOrConnectWithoutPositionDatasInput";
import { PositionFrameCreateWithoutPositionDatasInput } from "../inputs/PositionFrameCreateWithoutPositionDatasInput";
import { PositionFrameUpdateWithoutPositionDatasInput } from "../inputs/PositionFrameUpdateWithoutPositionDatasInput";
import { PositionFrameUpsertWithoutPositionDatasInput } from "../inputs/PositionFrameUpsertWithoutPositionDatasInput";
import { PositionFrameWhereUniqueInput } from "../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput", {
  isAbstract: true
})
export class PositionFrameUpdateOneRequiredWithoutPositionDatasNestedInput {
  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutPositionDatasInput, {
    nullable: true
  })
  create?: PositionFrameCreateWithoutPositionDatasInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameCreateOrConnectWithoutPositionDatasInput, {
    nullable: true
  })
  connectOrCreate?: PositionFrameCreateOrConnectWithoutPositionDatasInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpsertWithoutPositionDatasInput, {
    nullable: true
  })
  upsert?: PositionFrameUpsertWithoutPositionDatasInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: PositionFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpdateWithoutPositionDatasInput, {
    nullable: true
  })
  update?: PositionFrameUpdateWithoutPositionDatasInput | undefined;
}
