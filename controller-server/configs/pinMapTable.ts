import { PinMapTable, PinMapTableSchema } from "@/schema/PinMapTable";
import modelPinMapTable from "@/configs/modelPinMapTable";

// Record the pinmap for every dancer
const pinMapTable: PinMapTable = {
  "0_durant": {
    dancer: "0_durant",
    ...modelPinMapTable.boss,
  },
  "1_hsieh": {
    dancer: "1_hsieh",
    ...modelPinMapTable.bad_men,
  },
  "2_yuan": {
    dancer: "2_yuan",
    ...modelPinMapTable.bad_men,
  },
  "3_ping": {
    dancer: "3_ping",
    ...modelPinMapTable.bad_men,
  },
  "4_wei": {
    dancer: "4_wei",
    ...modelPinMapTable.bad_men,
  },
  "5_boyu": {
    dancer: "5_boyu",
    ...modelPinMapTable.good_men,
  },
  "6_yen": {
    dancer: "6_yen",
    ...modelPinMapTable.good_men,
  },
  "7_samklin": {
    dancer: "7_samklin",
    ...modelPinMapTable.good_men,
  },
  "8_how": {
    dancer: "8_how",
    ...modelPinMapTable.main_character,
  },
};

PinMapTableSchema.parse(pinMapTable);

export default pinMapTable;
