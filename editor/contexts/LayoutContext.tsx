import { createContext, useEffect } from "react";
import { useImmer } from "use-immer";

import {
  layoutContext,
  layoutPreference,
  layoutPreferenceKeys,
  layoutPreferenceValues,
} from "types/layout";

import { asyncSetItem, asyncGetItem } from "core/utils";

import { PREFERENCES } from "constants";

export const LayoutContext = createContext<layoutContext | null>(null);

const LayoutContextProvider = ({ children }: { children: JSX.Element }) => {
  const [preferences, setPreferences] = useImmer<layoutPreference>({
    editor: "beta",
    mode: "editor",
  });

  const initPreferences = async () => {
    const storageString = await asyncGetItem(PREFERENCES);
    if (storageString === null)
      asyncSetItem(PREFERENCES, JSON.stringify(preferences));
    else setPreferences(JSON.parse(storageString));
  };

  const setSinglePreference =
    (key: layoutPreferenceKeys) => (value: layoutPreferenceValues) => {
      setPreferences((preferences: layoutPreference) => ({
        ...preferences,
        [key]: value,
      }));
    };

  useEffect(() => {
    initPreferences();
  }, []);

  useEffect(() => {
    asyncSetItem(PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  return (
    <LayoutContext.Provider
      value={{
        preferences,
        setPreferences,
        setMode: setSinglePreference("mode"),
        setEditor: setSinglePreference("editor"),
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContextProvider;
