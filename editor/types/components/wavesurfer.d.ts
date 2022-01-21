export interface LocalRegion {
  Start: number;
  End: number;
  Value: number;
  ThreashRatio: number;
}

export interface Region {
  start: number;
  end: number;
  loop: boolean;
  color: string;
}

interface ControlMapElement {
  start: number;
  status: {};
  fade: boolean;
}

export interface ControlMap {
  [index: string]: ControlMapElement;
}

export type FilterType = "lowpass" | "highpass" | "notch";

export interface wavesurferContext {
  waveSurferApp: WaveSurferApp;
  markersToggle: boolean;
  initWaveSurferApp: (wave: WaveSurferApp) => void;
  toggleMarkers: Dispatch<SetStateAction<boolean>>;
}
