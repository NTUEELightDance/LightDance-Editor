import {
  LightPresetsType,
  posPresetsType,
  ControlMapStatus,
  positionType,
} from "types/globalSlice";

export interface PresetList {
  presets: LightPresetsType | posPresetsType;
  handleEditPresets: (name: string, idx: number) => void;
  handleDeletePresets: (idx: number) => void;
  handleSetCurrent:
    | ((status: ControlMapStatus) => void)
    | ((pos: positionType) => void);
}

export type setStatus = (status: ControlMapStatus) => void;
export type setPos = (pos: positionType) => void;
