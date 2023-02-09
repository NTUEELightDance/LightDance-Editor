import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateOrConnectWithoutControlDatasInput } from "../inputs/ControlFrameCreateOrConnectWithoutControlDatasInput";
import { ControlFrameCreateWithoutControlDatasInput } from "../inputs/ControlFrameCreateWithoutControlDatasInput";
import { ControlFrameUpdateWithoutControlDatasInput } from "../inputs/ControlFrameUpdateWithoutControlDatasInput";
import { ControlFrameUpsertWithoutControlDatasInput } from "../inputs/ControlFrameUpsertWithoutControlDatasInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput", {
  isAbstract: true
})
export class ControlFrameUpdateOneRequiredWithoutControlDatasNestedInput {
  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutControlDatasInput, {
    nullable: true
  })
  create?: ControlFrameCreateWithoutControlDatasInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameCreateOrConnectWithoutControlDatasInput, {
    nullable: true
  })
  connectOrCreate?: ControlFrameCreateOrConnectWithoutControlDatasInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpsertWithoutControlDatasInput, {
    nullable: true
  })
  upsert?: ControlFrameUpsertWithoutControlDatasInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: ControlFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpdateWithoutControlDatasInput, {
    nullable: true
  })
  update?: ControlFrameUpdateWithoutControlDatasInput | undefined;
}
