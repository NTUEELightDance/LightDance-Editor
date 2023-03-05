import type WaveSurferApp from "@/components/Wavesurfer/WaveSurferApp";
import type { PluginParams } from "wavesurfer.js/types/plugin";

export type FilterType = "lowpass" | "highpass" | "notch";

export interface wavesurferContext {
  waveSurferApp: WaveSurferApp;
  showMarkers: boolean;
  initWaveSurferApp: () => void;
  toggleMarkers: () => void;
}

export interface MarkerParams {
  time: number;
  label?: string;
  color?: string;
  key?: string | number;
  position?: "top" | "bottom";
  offset?: number;
  draggable?: boolean;
  markerElement?: HTMLElement;
}

export interface Marker {
  time: number;
  label: string;
  color: string;
  draggable: boolean;
  position: "top" | "bottom";
  offset?: number;
  el: HTMLElement;
}

export interface MarkersPluginParams extends PluginParams {
  markers?: MarkerParams[];
}
