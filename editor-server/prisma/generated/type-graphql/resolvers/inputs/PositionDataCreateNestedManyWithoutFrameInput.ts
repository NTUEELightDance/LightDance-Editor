import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyFrameInputEnvelope } from "../inputs/PositionDataCreateManyFrameInputEnvelope";
import { PositionDataCreateOrConnectWithoutFrameInput } from "../inputs/PositionDataCreateOrConnectWithoutFrameInput";
import { PositionDataCreateWithoutFrameInput } from "../inputs/PositionDataCreateWithoutFrameInput";
import { PositionDataWhereUniqueInput } from "../inputs/PositionDataWhereUniqueInput";

@TypeGraphQL.InputType("PositionDataCreateNestedManyWithoutFrameInput", {
  isAbstract: true
})
export class PositionDataCreateNestedManyWithoutFrameInput {
  @TypeGraphQL.Field(_type => [PositionDataCreateWithoutFrameInput], {
    nullable: true
  })
  create?: PositionDataCreateWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => [PositionDataCreateOrConnectWithoutFrameInput], {
    nullable: true
  })
  connectOrCreate?: PositionDataCreateOrConnectWithoutFrameInput[] | undefined;

  @TypeGraphQL.Field(_type => PositionDataCreateManyFrameInputEnvelope, {
    nullable: true
  })
  createMany?: PositionDataCreateManyFrameInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PositionDataWhereUniqueInput], {
    nullable: true
  })
  connect?: PositionDataWhereUniqueInput[] | undefined;
}
