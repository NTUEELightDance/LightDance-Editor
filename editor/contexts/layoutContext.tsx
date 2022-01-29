import { useState, createContext } from "react";
import { layoutContext, layoutMode, editorPreference } from "types/layout";

// config
import "flexlayout-react/style/dark.css";
import "./layout.css";

export const LayoutContext = createContext<layoutContext | null>(null);

const LayoutContextProvider = ({ children }: { children: JSX.Element }) => {
  const [preferedEditor, setPreferedEditor] =
    useState<editorPreference>("default");
  const [mode, setMode] = useState<layoutMode>("editor");

  return (
    <LayoutContext.Provider
      value={{ preferedEditor, setPreferedEditor, mode, setMode }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContextProvider;
