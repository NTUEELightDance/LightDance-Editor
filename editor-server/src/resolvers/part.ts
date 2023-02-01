// import {
//   Resolver,
//   Mutation,
//   FieldResolver,
//   Ctx,
//   Arg,
//   Root,
//   PubSub,
//   Publisher,
// } from "type-graphql";

// import { Part } from "./types/part";
// import { AddPartInput, EditPartInput, DeletePartInput } from "./inputs/part";
// import { ControlDefault } from "./types/controlType";
// import { Topic } from "./subscriptions/topic";
// import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
// import { PartResponse } from "./response/partResponse";
// import { generateID, initRedisControl, initRedisPosition } from "../utility";
// import { IControl, IControlFrame, IDancer, IPart, TContext } from "../types/global";

// @Resolver((of) => Part)
// export class PartResolver {
//   @Mutation((returns) => PartResponse)
//   async addPart(
//     @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
//     @Arg("part") newPartData: AddPartInput,
//     @Ctx() ctx: TContext
//   ) {
//     const existDancer = await ctx.db.Dancer.findOne({
//       name: newPartData.dancerName,
//     }).populate("parts");
//     if (existDancer) {
//       const duplicatePartName = existDancer.parts.filter(
//         (part: Part) => part.name === newPartData.name
//       );
//       if (duplicatePartName.length === 0) {
//         const newPart = new ctx.db.Part({
//           name: newPartData.name,
//           type: newPartData.type,
//           value: ControlDefault[newPartData.type],
//           id: generateID(),
//         });
//         const allControlFrames: IControlFrame[] = await ctx.db.ControlFrame.find();
//         allControlFrames.map(async (controlframe) => {
//           const newControl = new ctx.db.Control({
//             frame: controlframe._id,
//             value: ControlDefault[newPartData.type],
//           });
//           newPart.controlData.push(newControl._id);
//           await newControl.save();
//         });

//         // for each position frame, add empty position data to the dancer
//         const dancer = await ctx.db.Dancer.update(
//           { name: newPartData.dancerName },
//           { $push: { parts: newPart._id } }
//         );
//         const result = await newPart.save();
//         const dancerData = await ctx.db.Dancer.findOne({
//           name: newPartData.dancerName,
//         }).populate("parts");
//         await initRedisControl();
//         await initRedisPosition();
//         const payload: DancerPayload = {
//           mutation: dancerMutation.UPDATED,
//           editBy: ctx.userID,
//           dancerData,
//         };
//         await publish(payload);

//         return Object.assign(result, { ok: true });
//       }
//       return {
//         name: "",
//         type: null,
//         id: "",
//         ok: false,
//         msg: "duplicate part",
//         controlData: [],
//       };
//     }
//     return {
//       name: "",
//       type: null,
//       id: "",
//       ok: false,
//       msg: "no dancer",
//       controlData: [],
//     };
//   }

//   @Mutation((returns) => PartResponse)
//   async editPart(
//     @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
//     @Arg("part") newPartData: EditPartInput,
//     @Ctx() ctx: TContext
//   ) {
//     const { id, name, type, dancerName } = newPartData;
//     const edit_part = await ctx.db.Part.findOne({ id });
//     if (edit_part) {
//       if (edit_part.type !== type) {
//         edit_part.controlData.map(async (id: string) => {
//           const data = await ctx.db.Control.findOneAndUpdate(
//             { _id: id },
//             { value: ControlDefault[type] }
//           );
//         });
//       }
//       const result = await ctx.db.Part.findOneAndUpdate(
//         { id },
//         { name, type },
//         { new: true }
//       );
//       const dancerData = await ctx.db.Dancer.findOne({
//         name: dancerName,
//       }).populate("parts");
//       await initRedisControl();
//       await initRedisPosition();
//       const payload: DancerPayload = {
//         mutation: dancerMutation.UPDATED,
//         editBy: ctx.userID,
//         dancerData,
//       };
//       await publish(payload);
//       return Object.assign(result, { ok: true });
//     }
//     return {
//       name: "",
//       type: null,
//       id: "",
//       ok: false,
//       msg: "no part found",
//       controlData: [],
//     };
//   }

//   @Mutation((returns) => PartResponse)
//   async deletePart(
//     @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
//     @Arg("part") newPartData: DeletePartInput,
//     @Ctx() ctx: TContext
//   ) {
//     const { id, dancerName } = newPartData;
//     const part = await ctx.db.Part.findOne({ id });
//     if (part) {
//       const part_id = part._id;
//       await Promise.all(
//         part.controlData.map(async (ref: string) => {
//           await ctx.db.Control.deleteOne({ _id: ref });
//         })
//       );
//       await ctx.db.Part.deleteOne({ id });
//       const dancer: IDancer = await ctx.db.Dancer.findOne({ name: dancerName });
//       if (dancer) {
//         await ctx.db.Dancer.updateOne(
//           { name: dancerName },
//           { $pullAll: { parts: [{ _id: part_id }] } }
//         );
//       }
//       const dancerData = await ctx.db.Dancer.findOne({
//         name: dancerName,
//       }).populate("parts");
//       await initRedisControl();
//       await initRedisPosition();
//       const payload: DancerPayload = {
//         mutation: dancerMutation.UPDATED,
//         editBy: ctx.userID,
//         dancerData,
//       };
//       await publish(payload);
//       return Object.assign(part, { ok: true });
//     }
//     return {
//       name: "",
//       type: null,
//       id: "",
//       ok: false,
//       msg: "no part found",
//       controlData: [],
//     };
//   }

//   @FieldResolver()
//   async controlData(@Root() part: IPart, @Ctx() ctx: TContext) {
//     const result = await Promise.all(
//       part.controlData.map(async (ref: string) => {
//         const data: IControl = await ctx.db.Control.findOne({ _id: ref }).populate(
//           "frame"
//         );
//         return data;
//       })
//     );
//     // return data

//     return result;
//   }
// }

import {
  Resolver,
  Mutation,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  PubSub,
  Publisher,
} from "type-graphql";
import { AddPartInput, EditPartInput, DeletePartInput } from "./inputs/part";
import { ControlDefault } from "./types/controlType";
import { Topic } from "./subscriptions/topic";
import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
import { PartResponse } from "./response/partResponse";
import { generateID, initRedisControl, initRedisPosition } from "../utility";
import { IControl, IControlFrame, IDancer, IPart, TContext } from "../types/global";
import { ControlData, ControlFrame, Part } from "../../prisma/generated/type-graphql";

@Resolver((of) => Part)
export class PartResolver {
  @Mutation((returns) => PartResponse)
  async addPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: AddPartInput,
    @Ctx() ctx: TContext
  ) {
    const existDancer = await ctx.prisma.dancer.findFirst({
      where: { name: newPartData.dancerName },
      include: { parts: true },
    });

    if (existDancer) {
      const duplicatePartName = existDancer.parts.filter(
        (part: Part) => part.name === newPartData.name
      );
      if (duplicatePartName.length === 0) {
        const newPart = await ctx.prisma.part.create({
          data: {
            dancerId: existDancer.id,
            name: newPartData.name,
            type: newPartData.type,
          },
        });

        const allControlFrames = await ctx.prisma.controlFrame.findMany();
        await ctx.prisma.controlData.createMany({
          data: allControlFrames.map(controlFrame=>(
            {
              partId: newPart.id,
              frameId: controlFrame.id,
              value: ControlDefault[newPartData.type],
            }
          ))
        });
        // for each position frame, add empty position data to the dancer
        await ctx.prisma.dancer.update({
          where: { id: existDancer.id },
          data: {
            parts: {
              connect: {
                id: newPart.id,
              },
            },
          },
        });
        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
        };
        await publish(payload);

        return {partData: newPart, ok: true, msg:"successfully add part"};
      }
      return {
        ok: false,
        msg: "duplicate part",
      };
    }
    return {
      ok: false,
      msg: "no dancer",
    };
  }

  @Mutation((returns) => PartResponse)
  async editPart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: EditPartInput,
    @Ctx() ctx: TContext
  ) {
    const { id, name, type } = newPartData;
    const edit_part = await ctx.prisma.part.findFirst({
      where: { id },
      include: { controlData: true },
    });
    if (edit_part) {
      if (edit_part.type !== type) {
        edit_part.controlData.map(async (id) => { // id is what?
          await ctx.prisma.controlData.update({
            where: { partId_frameId: { partId: edit_part.id, frameId:id.frameId } },
            data: { value: ControlDefault[type] },
          });
        });
        const result = await ctx.prisma.part.update({
          where: { id: id },
          data: { name: name, type: type },
        });

        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
        };
        await publish(payload);
        return { partData: result, ok: true, msg: "successfully edit part"};
      }
      return {
        ok: false,
        msg: "part type no change",
      };
    }
    return {
      ok: false,
      msg: "no part found",
    };
  }

  @Mutation((returns) => PartResponse)
  async deletePart(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("part") newPartData: DeletePartInput,
    @Ctx() ctx: TContext
  ) {
    const { id, dancerName } = newPartData;
    const part = await ctx.prisma.part.findFirst({
      where: { id },
      include: { controlData: true },
    });
    if (part) {
      const dancer = await ctx.prisma.dancer.findFirst({
        where: { name: dancerName },
        include: { parts: true },
      });
      if(dancer&&part.dancerId===dancer.id) {
        await ctx.prisma.controlData.deleteMany({
          where: { partId: id },
        });
        await ctx.prisma.dancer.update({
          where: { id: dancer.id },
          data: {
            parts: {
              delete: {
                id: part.id,
              },
            },
          },
        });
        await initRedisControl();
        await initRedisPosition();
        const payload: DancerPayload = {
          mutation: dancerMutation.UPDATED,
          editBy: Number(ctx.userID),
        };
        await publish(payload);
        return {ok: true, msg: "successfully delete part"};
      }
      return {
        ok: false,
        msg: "no dancer found",
      };
    }else{
      return {
        ok: false,
        msg: "no part found",
      };
    }
  }

  @FieldResolver((returns)=>[ControlData])
  async controlData(@Root() part: Part, @Ctx() ctx: TContext) {
    const result = await ctx.prisma.controlData.findMany({
      where: { partId: part.id },
      include: { frame: true },
    });
    // return data
    return result;
  }
}
