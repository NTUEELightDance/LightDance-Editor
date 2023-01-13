import { Resolver, FieldResolver, Root, Ctx, ResolverInterface } from "type-graphql";
import { Control } from "./types/control";

@Resolver((of) => Control)
export class ControlResolver implements ResolverInterface<Control> {
  @FieldResolver()
  async frame(@Root() control: Control, @Ctx() ctx: any) {
    const data = await ctx.db.ControlFrame.findOne({ _id: control.frame });
    return data;
  }

  @FieldResolver()
  async status(@Root() control: Control, @Ctx() ctx: any) {
    return control.value;
  }
}
