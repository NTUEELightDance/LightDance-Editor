import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DancerCreateNestedOneWithoutPartsInput } from "../inputs/DancerCreateNestedOneWithoutPartsInput";
import { PartType } from "../../enums/PartType";

@TypeGraphQL.InputType("PartCreateWithoutControlDataInput", {
  isAbstract: true
})
export class PartCreateWithoutControlDataInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PartType, {
    nullable: false
  })
  type!: "LED" | "FIBER";

  @TypeGraphQL.Field(_type => DancerCreateNestedOneWithoutPartsInput, {
    nullable: false
  })
  dancer!: DancerCreateNestedOneWithoutPartsInput;
}
