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

export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const editMode = useReactiveVar(reactiveState.editMode);
  const { page } = useRoute();

  return (
    <Stack direction="column">
      <StateIndicator editMode={editMode} />
      <AppBar position="static" color="transparent">
        <Toolbar style={{ minHeight: "6vh", width: "100%" }}>
          <Box sx={{ height: "6vh", p: "1vh 1vw", mr: "1vw" }}>
            <img
              src="/LDlogoWhite.png"
              alt="NTUEE Light Dance logo"
              style={{ height: "100%" }}
            />
          </Box>
          <PageSelector />
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              right: "2vw",
              gap: "1vw",
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
