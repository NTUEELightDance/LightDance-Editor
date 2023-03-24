import client from "@/client";
import {
  SHIFT_TIME,
  TimeShiftMutationResponseData,
  TimeShiftMutationVariables,
} from "@/graphql";

export const timeShiftAgent = {
  shift: async ({
    frameType,
    interval,
    displacement,
  }: {
    frameType: "position" | "control" | "both";
    interval: [number, number];
    // milliseconds
    displacement: number;
  }) => {
    try {
      const { data } = await client.mutate<
        TimeShiftMutationResponseData,
        TimeShiftMutationVariables
      >({
        mutation: SHIFT_TIME,
        variables: {
          shiftPosition: frameType !== "control",
          shiftControl: frameType !== "position",
          move: displacement,
          start: interval[0],
          end: interval[1],
        },
      });

      const ok = data?.shift?.ok;

      if (!ok) {
        throw new Error(data?.shift?.msg ?? "Unknown Error");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
