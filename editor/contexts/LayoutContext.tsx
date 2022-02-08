import { useState, createContext } from "react";
import { layoutContext, layoutMode, editorPreference } from "types/layout";

export const LayoutContext = createContext<layoutContext | null>(null);

const LayoutContextProvider = ({ children }: { children: JSX.Element }) => {
  const [mode, setMode] = useState<layoutMode>("editor");
  const [preferedEditor, setPreferedEditor] =
    useState<editorPreference>("default");
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  return (
    <LayoutContext.Provider
      value={{
        preferedEditor,
        setPreferedEditor,
        mode,
        setMode,
        showSimulator,
        setShowSimulator,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContextProvider;
