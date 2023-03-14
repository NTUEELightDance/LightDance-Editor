import { PinMapTable, PinMapTableSchema } from "@/schema/PinMapTable";

// Record the pinmap for every dancer
const pinMapTable: PinMapTable = {
  "6_stantheman": {
    fps: 30,
    OFPARTS: {
      of1: 0,
      of2: 1,
      of3: 2,
      of4: 25,
      of5: 5,
      of6: 6,
      of7: 7,
      of8: 17,
      of9: 19,
      of10: 21,
      of11: 23,
      of12: 9,
      of13: 13,
      of14: 14,
      of15: 3,
      of16: 20,
      of17: 4,
      of18: 11,
      of19: 18,
      of20: 12,
    },
    LEDPARTS: {
      led1: {
        id: 0,
        len: 4,
      },
      led2: {
        id: 1,
        len: 4,
      },
      led3: {
        id: 2,
        len: 4,
      },
    },
  },
};

PinMapTableSchema.parse(pinMapTable);

export default pinMapTable;
