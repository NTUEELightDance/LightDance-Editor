import type {
  LightPresetsType,
  PosPresetsType,
} from "@/components/Presets/presets";

export interface LoadType {
  // refer to /data/load.json""
  Music: string;
  LightPresets: string;
  PosPresets: string;
  DancerMap: Record<
    string,
    {
      url: string;
      modelName: string;
    }
  >;
}

export interface LoadState {
  init: boolean;
  music: string; // load music path
  load: LoadType;
  lightPresets: LightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  posPresets: PosPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  dancerMap: Record<
    string,
    {
      url: string;
      modelName: string;
    }
  >;
}
