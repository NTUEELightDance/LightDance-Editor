import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";

import { Settings } from "../Settings";
import Tools from "components/Tools";

// components
import EditorSelector from "components/EditorSelector";
import EditButtons from "components/EditButtons";
import StateIndicator from "./StateIndicator";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import useRoute from "@/hooks/useRoute";

export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const editMode = useReactiveVar(reactiveState.editMode);
  const { page, navigate } = useRoute();

  return (
    <Stack direction="column">
      <StateIndicator editMode={editMode} />
      <AppBar position="static" color="transparent">
        <Toolbar style={{ minHeight: "6vh", width: "100%" }}>
          <Box sx={{ height: "6vh", p: "1vh 1vw", mr: "3vw" }}>
            <img
              src="/LDlogoWhite.png"
              alt="NTUEE Light Dance logo"
              style={{ height: "100%" }}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              if (page === "EDITOR") {
                navigate.toCommandCenter();
              } else if (page === "COMMAND_CENTER") {
                navigate.toEditor();
              } else {
                navigate.toLogin();
              }
              window.location.reload();
            }}
          >
            {page == "EDITOR" ? "command" : "editor"}
          </Button>
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
