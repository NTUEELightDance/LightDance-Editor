import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateOrConnectWithoutControlDataInput } from "../inputs/PartCreateOrConnectWithoutControlDataInput";
import { PartCreateWithoutControlDataInput } from "../inputs/PartCreateWithoutControlDataInput";
import { PartUpdateWithoutControlDataInput } from "../inputs/PartUpdateWithoutControlDataInput";
import { PartUpsertWithoutControlDataInput } from "../inputs/PartUpsertWithoutControlDataInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartUpdateOneRequiredWithoutControlDataNestedInput", {
  isAbstract: true
})
export class PartUpdateOneRequiredWithoutControlDataNestedInput {
  @TypeGraphQL.Field(_type => PartCreateWithoutControlDataInput, {
    nullable: true
  })
  create?: PartCreateWithoutControlDataInput | undefined;

  @TypeGraphQL.Field(_type => PartCreateOrConnectWithoutControlDataInput, {
    nullable: true
  })
  connectOrCreate?: PartCreateOrConnectWithoutControlDataInput | undefined;

  @TypeGraphQL.Field(_type => PartUpsertWithoutControlDataInput, {
    nullable: true
  })
  upsert?: PartUpsertWithoutControlDataInput | undefined;

  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: true
  })
  connect?: PartWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => PartUpdateWithoutControlDataInput, {
    nullable: true
  })
  update?: PartUpdateWithoutControlDataInput | undefined;
}
