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
  "9_staff": {
    dancer: "9_staff",
    ...modelPinMapTable.staff,
  },
  "11_small_orb_1": {
    dancer: "11_small_orb_1",
    ...modelPinMapTable.small_orb_1,
  },
  "12_small_orb_2": {
    dancer: "12_small_orb_2",
    ...modelPinMapTable.small_orb_2,
  },
  "13_big_orb_left": {
    dancer: "13_big_orb_left",
    ...modelPinMapTable.big_orb_left,
  },
  "14_big_orb_right": {
    dancer: "14_big_orb_right",
    ...modelPinMapTable.big_orb_right,
  },
  "17_pillar_1": {
    dancer: "17_pillar_1",
    ...modelPinMapTable.pillar_1,
  },
  "18_pillar_2": {
    dancer: "18_pillar_2",
    ...modelPinMapTable.pillar_2,
  },
  "19_pillar_3": {
    dancer: "19_pillar_3",
    ...modelPinMapTable.pillar_3,
  },
  "20_pillar_4": {
    dancer: "20_pillar_4",
    ...modelPinMapTable.pillar_4,
  },
  "26_saber": {
    dancer: "26_saber",
    ...modelPinMapTable.saber,
  },
};

PinMapTableSchema.parse(pinMapTable);

export default pinMapTable;
