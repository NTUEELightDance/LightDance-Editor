import { useState } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

import { LayoutButtons } from "./LayoutButtons";
import { Settings } from "../Settings";

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

        <Settings
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </Toolbar>
    </AppBar>
  );
}
