import { useState } from "react";
import { AppBar, Toolbar, Box } from "@mui/material";

import { LayoutButtons } from "./LayoutButtons";
import { Settings } from "../Settings";
import Tools from "components/Tools";

// components
import EditorSelector from "components/EditorSelector";
import EditButtons from "components/EditButtons";

/**
 * Top Bar, include title, timeController, upload/download btn
 */
export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <AppBar position="static" color="transparent">
      <Toolbar style={{ minHeight: "6vh", width: "100%" }}>
        <Box sx={{ height: "6vh", p: "1vh 1vw", mr: "3vw" }}>
          <img
            src="/asset/Header/LDlogoWhite.png"
            alt="NTUEE Light Dance logo"
            style={{ height: "100%" }}
          />
        </Box>
        <LayoutButtons />
        <Box
          sx={{
            display: "flex",
            position: "absolute",
            right: "2vw",
            gap: "1vw",
          }}
        >
          <EditButtons />
          <EditorSelector />
          <Tools />
          <Settings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
