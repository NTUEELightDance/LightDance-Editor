import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { Control } from "./types/control";

@Resolver((of) => Control)
export class ControlResolver {
  @FieldResolver()
  async frame(@Root() control: any, @Ctx() ctx: any) {
    let data = await ctx.db.ControlFrame.findOne({ _id: control.frame });
    return data;
  }

  @FieldResolver()
  async status(@Root() control: any, @Ctx() ctx: any) {
    return control.value;
  }
}
