import {
  Resolver,
  Ctx,
  Arg,
  Query,
  Mutation,
  PubSub,
  Publisher,
} from "type-graphql";

import { PosData } from "./types/posData";
import { Map } from "./types/map";
import { EditPositionInput } from "./inputs/position";
import { Topic } from "./subscriptions/topic";
import { generateID } from "../utility";
import { PositionMapPayload } from "./subscriptions/positionMap";
import { updateRedisPosition } from "../utility";
import {
  PositionRecordPayload,
  PositionRecordMutation,
} from "./subscriptions/positionRecord";
import { IDancer, IPosition, IPositionFrame, TContext } from "../types/global";

@Resolver((of) => Map)
export class PosMapResolver {
  @Query((returns) => Map)
  async PosMap(@Ctx() ctx: TContext) {
    const frames: IPositionFrame[] = await ctx.db.PositionFrame.find();
    const id = frames.map((frame) => {
      return { id: frame.id, _id: frame._id };
    });
    return { frames: id };
  }
}

@Resolver((of) => PosData)
export class EditPosMapResolver {
  @Mutation((returns) => Map)
  async editPosMap(
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap) publish: Publisher<PositionMapPayload>,
    @Arg("positionData", (type) => [EditPositionInput])
    positionData: EditPositionInput[],
    @Arg("start") startTime: number,
    @Ctx() ctx: TContext
  ) {
    // find a position frame
    const positionFrame = await ctx.db.PositionFrame.findOne({
      start: startTime,
    });

    // if position frame not found
    if (!positionFrame) {
      const newPositionFrame = await new ctx.db.PositionFrame({
        start: startTime,
        id: generateID(),
      });

      // check payload
      const dancers = await ctx.db.Dancer.find();
      if (positionData.length !== dancers.length) {
        throw new Error(
          `Not all dancers in payload. Missing number: ${
            dancers.length - positionData.length
          }`
        );
      }
      await Promise.all(
        positionData.map(async (data) => {
          const { dancerName } = data;
          const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
        })
      );

      // add new positions
      await Promise.all(
        positionData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancerPositionData = data.positionData;
          // create new position for every dancer
          const newPosition = new ctx.db.Position({
            frame: newPositionFrame,
            x: dancerPositionData.x,
            y: dancerPositionData.y,
            z: dancerPositionData.z,
            id: generateID(),
          });
          await newPosition.save();

          // push
          await ctx.db.Dancer.findOneAndUpdate(
            { name: dancerName },
            {
              $push: {
                positionData: newPosition,
              },
            }
          );
        })
      );
      await newPositionFrame.save();
      await updateRedisPosition(newPositionFrame.id);
      // subscription
      const mapPayload: PositionMapPayload = {
        editBy: ctx.username,
        frame: {
          createList: [newPositionFrame.id],
          deleteList: [],
          updateList: [],
        },
      };
      await publish(mapPayload);

      const allPositionFrames: IPositionFrame[] =
        await ctx.db.PositionFrame.find().sort({
          start: 1,
        });
      let index = -1;
      allPositionFrames.map((frame, idx: number) => {
        if (frame.id === newPositionFrame.id) {
          index = idx;
        }
      });

      const recordPayload: PositionRecordPayload = {
        mutation: PositionRecordMutation.CREATED,
        editBy: ctx.username,
        addID: [newPositionFrame.id],
        updateID: [],
        deleteID: [],
        index,
      };
      await publishPositionRecord(recordPayload);
      return {
        frames: [{ _id: newPositionFrame._id, id: newPositionFrame.id }],
      };
    }

    // if position frame found
    else {
      const { editing, _id, id: frameID } = positionFrame;
      if (editing !== ctx.username) {
        throw new Error(`The frame is now editing by ${editing}.`);
      }

      // check payload
      const dancers = await ctx.db.Dancer.find();
      if (positionData.length !== dancers.length) {
        throw new Error(
          `Not all dancers in payload. Missing number: ${
            dancers.length - positionData.length
          }`
        );
      }
      await Promise.all(
        positionData.map(async (data) => {
          const { dancerName } = data;
          const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
          if (!dancer) {
            throw new Error(`Dancer ${dancerName} not found`);
          }
        })
      );

      // updata positions
      await Promise.all(
        positionData.map(async (data) => {
          const dancerName = data.dancerName;
          const dancerPositionData = data.positionData;
          const dancer: IDancer = await ctx.db.Dancer.findOne({
            name: dancerName,
          }).populate("positionData");

          await Promise.all(
            dancer.positionData.map(async (position: IPosition) => {
              if (position.frame.toString() === _id.toString()) {
                await ctx.db.Position.updateOne(
                  { _id: position._id },
                  {
                    x: dancerPositionData.x,
                    y: dancerPositionData.y,
                    z: dancerPositionData.z,
                  }
                );
              }
            })
          );
        })
      );

      // positionframe editing cancel
      await ctx.db.PositionFrame.updateOne({ id: frameID }, { editing: null });

      await updateRedisPosition(frameID);
      // subscription
      const payload: PositionMapPayload = {
        editBy: ctx.username,
        frame: {
          createList: [],
          deleteList: [],
          updateList: [frameID],
        },
      };
      await publish(payload);
      return { frames: [{ _id, id: frameID }] };
    }
  }
}
