import { IJsonModel } from "flexlayout-react";
import { Updater } from "use-immer";

export interface layoutContext {
  preferences: layoutPreference;
  setPreferences: Updater<layoutPreference>;
  setMode: SinglePreferenceSetter<layoutMode>;
  setEditor: SinglePreferenceSetter<editorPreference>;
}

export type layoutPreference = {
  mode: layoutMode;
  editor: editorPreference;
};

export type SinglePreferenceSetter<T> = (value: T) => void;

export type layoutPreferenceKeys = "mode" | "editor";

export type layoutPreferenceValues = layoutMode | editorPreference;

export type layoutMode = "editor" | "command";

export type editorPreference = "default" | "mirrored";
