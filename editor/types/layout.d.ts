import { IJsonModel } from "flexlayout-react";

export interface layoutContext {
  mode: layoutMode;
  setMode: (mode: layoutMode) => void;
  preferedEditor: editorPreference;
  setPreferedEditor: (preference: editorPreference) => void;
  showSimulator: boolean;
  setShowSimulator: (showSimulator: boolean) => void;
}

export type layoutMode = "editor" | "command";

export type editorPreference = "default" | "legacy" | "mirrored";
