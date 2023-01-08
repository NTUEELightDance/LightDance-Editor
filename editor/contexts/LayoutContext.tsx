import { createContext, useEffect, useContext } from "react";
import { useImmer } from "use-immer";

import {
  layoutContext,
  layoutPreference,
  layoutPreferenceKeys,
  layoutPreferenceValues,
} from "types/layout";

import { asyncSetItem, asyncGetItem } from "core/utils";

import { PREFERENCES } from "@/constants";

const LayoutContext = createContext<layoutContext | null>(null);

export const useLayout = () => useContext(LayoutContext) as layoutContext;

const LayoutContextProvider = ({ children }: { children: JSX.Element }) => {
  const [preferences, setPreferences] = useImmer<layoutPreference>({
    editor: "default",
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
