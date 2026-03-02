import { PinMapTable, PinMapTableSchema } from "@/schema/PinMapTable";
import modelPinMapTable from "@/configs/modelPinMapTable";

// Record the pinmap for every dancer
const pinMapTable: PinMapTable = {
  "0_liao": {
    dancer: "0_liao",
    ...modelPinMapTable.ghost_king,
  },
  "1_lin": {
    dancer: "1_lin",
    ...modelPinMapTable.ghost_king,
  },
  "2_feng": {
    dancer: "2_feng",
    ...modelPinMapTable.main_girl,
  },
  "3_chen": {
    dancer: "3_chen",
    ...modelPinMapTable.main_girl,
  },
  "4_roy": {
    dancer: "4_roy",
    ...modelPinMapTable.vampire,
  },
  "5_chiu": {
    dancer: "5_chiu",
    ...modelPinMapTable.vampire,
  },
  "6_su": {
    dancer: "6_su",
    ...modelPinMapTable.main_boy,
  },
  "7_li": {
    dancer: "7_li",
    ...modelPinMapTable.main_boy,
  },
  "8_hsieh": {
    dancer: "8_hsieh",
    ...modelPinMapTable.hunter,
  },
  "9_yang": {
    dancer: "9_yang",
    ...modelPinMapTable.hunter,
  },
  "10_tsai": {
    dancer: "10_tsai",
    ...modelPinMapTable.hunter,
  },
  "11_luo": {
    dancer: "11_luo",
    ...modelPinMapTable.hunter,
  },
  "12_coffin": {
    dancer: "12_coffin",
    ...modelPinMapTable.coffin,
  },
  "13_altar_top1": {
    dancer: "13_altar_top1",
    ...modelPinMapTable.altar1_top,
  },
  "14_altar_bottom1": {
    dancer: "14_altar_bottom1",
    ...modelPinMapTable.altar1_bottom,
  },
  "15_altar_top2": {
    dancer: "15_altar_top2",
    ...modelPinMapTable.altar2_top,
  },
  "16_altar_bottom2": {
    dancer: "16_altar_bottom2",
    ...modelPinMapTable.altar2_bottom,
  },
  "17_cross": {
    dancer: "17_cross",
    ...modelPinMapTable.cross,
  },
  "18_gem": {
    dancer: "18_gem",
    ...modelPinMapTable.gem,
  },
  "19_pole": {
    dancer: "19_pole",
    ...modelPinMapTable.pole,
  },
  "20_fireplace": {
    dancer: "20_fireplace",
    ...modelPinMapTable.fireplace,
  },
  "21_axe1": {
    dancer: "21_axe1",
    ...modelPinMapTable.axe,
  },
  "22_axe2": {
    dancer: "22_axe2",
    ...modelPinMapTable.axe,
  },
  "23_balcony": {
    dancer: "23_balcony",
    ...modelPinMapTable.balcony,
  },
  "24_gun": {
    dancer: "24_gun",
    ...modelPinMapTable.gun,
  },
  "25_staff1": {
    dancer: "25_staff1",
    ...modelPinMapTable.staff,
  },
  "26_staff2": {
    dancer: "26_staff2",
    ...modelPinMapTable.staff,
  },
};

PinMapTableSchema.parse(pinMapTable);

export default pinMapTable;
