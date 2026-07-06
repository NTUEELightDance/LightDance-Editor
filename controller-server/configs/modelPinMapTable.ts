import { ModelPinMapTableSchema } from "@/schema/PinMapTable";
import { PropPinMapTable } from "@/configs/propPinMapTable";
import { characterPinMapTable } from "@/configs/characterPinMapTable";

const modelPinMapTable = { ...characterPinMapTable, ...PropPinMapTable };

ModelPinMapTableSchema.parse(modelPinMapTable);

export default modelPinMapTable;
