import { ControlMapStatus, DancerCoordinates } from "core/types";

/**
 * LightPresets type
 */
export type LightPresetsType = LightPresetsElement[];
export interface LightPresetsElement {
  name: string; // ID named by user
  status: ControlMapStatus;
}

/**
 * PosPresets type
 */
export type PosPresetsType = PosPresetsElement[];
export interface PosPresetsElement {
  name: string;
  pos: DancerCoordinates;
}

/**
 * PresetsList type
 */
export interface PresetsListType {
  presets: LightPresetsType | PosPresetsType;
  handleEditPresets: (name: string, idx: number) => void;
  handleDeletePresets: (idx: number) => void;
  handleSetCurrent:
    | ((status: ControlMapStatus) => void)
    | ((pos: PosMapElement) => void);
}
