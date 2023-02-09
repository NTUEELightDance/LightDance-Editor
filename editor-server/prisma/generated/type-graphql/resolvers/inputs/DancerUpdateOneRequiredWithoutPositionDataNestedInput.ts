import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateOrConnectWithoutPositionDataInput } from "../inputs/DancerCreateOrConnectWithoutPositionDataInput";
import { DancerCreateWithoutPositionDataInput } from "../inputs/DancerCreateWithoutPositionDataInput";
import { DancerUpdateWithoutPositionDataInput } from "../inputs/DancerUpdateWithoutPositionDataInput";
import { DancerUpsertWithoutPositionDataInput } from "../inputs/DancerUpsertWithoutPositionDataInput";
import { DancerWhereUniqueInput } from "../inputs/DancerWhereUniqueInput";

@TypeGraphQL.InputType("DancerUpdateOneRequiredWithoutPositionDataNestedInput", {
  isAbstract: true
})
export class DancerUpdateOneRequiredWithoutPositionDataNestedInput {
  @TypeGraphQL.Field(_type => DancerCreateWithoutPositionDataInput, {
    nullable: true
  })
  create?: DancerCreateWithoutPositionDataInput | undefined;

  @TypeGraphQL.Field(_type => DancerCreateOrConnectWithoutPositionDataInput, {
    nullable: true
  })
  connectOrCreate?: DancerCreateOrConnectWithoutPositionDataInput | undefined;

  @TypeGraphQL.Field(_type => DancerUpsertWithoutPositionDataInput, {
    nullable: true
  })
  upsert?: DancerUpsertWithoutPositionDataInput | undefined;

  @TypeGraphQL.Field(_type => DancerWhereUniqueInput, {
    nullable: true
  })
  connect?: DancerWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => DancerUpdateWithoutPositionDataInput, {
    nullable: true
  })
  update?: DancerUpdateWithoutPositionDataInput | undefined;
}
