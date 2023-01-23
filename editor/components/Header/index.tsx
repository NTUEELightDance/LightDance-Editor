import { useState } from "react";
import { AppBar, Toolbar, Box, Stack } from "@mui/material";

import { Settings } from "../Settings";
import Tools from "components/Tools";

// components
import EditorSelector from "components/EditorSelector";
import EditButtons from "components/EditButtons";
import StateIndicator from "./StateIndicator";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import useMode from "@/hooks/useMode";

/**
 * Top Bar, include title, timeController, upload/download btn
 */
export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const editMode = useReactiveVar(reactiveState.editMode);
  const mode = useMode();

  return (
    <Stack direction="column">
      <StateIndicator editMode={editMode} />
      <AppBar position="static" color="transparent">
        <Toolbar style={{ minHeight: "6vh", width: "100%" }}>
          <Box sx={{ height: "6vh", p: "1vh 1vw", mr: "3vw" }}>
            <img
              src="LDlogoWhite.png"
              alt="NTUEE Light Dance logo"
              style={{ height: "100%" }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              right: "2vw",
              gap: "1vw",
            }}
          >
            {mode === "editor" && (
              <>
                <EditButtons />
                <EditorSelector />
                <Tools />
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
