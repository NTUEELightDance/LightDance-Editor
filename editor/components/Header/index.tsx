import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import { Settings } from "./Settings";

// components
import EditorSelector from "@/components/Header/EditorSelector";
import EditButtons from "@/components/Header/EditButtons";
import StateIndicator from "./StateIndicator";
import PageSelector from "./PageSelector";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import useRoute from "@/hooks/useRoute";
import LEDEditorDisplay from "./LEDEditorDisplay";

export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const editorState = useReactiveVar(reactiveState.editorState);
  const { page } = useRoute();

  return (
    <Stack direction="column">
      <StateIndicator editMode={editorState} />
      <AppBar position="static" color="transparent">
        <Toolbar style={{ minHeight: "6vh", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <img
              src="/LDlogoWhite.png"
              alt="NTUEE Light Dance logo"
              style={{ height: "2.5rem" }}
            />
            <PageSelector />
            <LEDEditorDisplay />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            {page === "EDITOR" && (
              <>
                <EditButtons />
                <EditorSelector />
              </>
            )}
            <Settings
              showSettings={showSettings}
              setShowSettings={setShowSettings}
            />
          </Box>
        </Toolbar>
      </AppBar>
    </Stack>
  );
}
