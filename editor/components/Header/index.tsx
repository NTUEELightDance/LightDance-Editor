import { useState, useContext } from "react";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";

import { LayoutContext } from "contexts/LayoutContext";

import { LayoutButtons } from "./LayoutButtons";
import { Settings } from "../Settings";

import { layoutContext } from "types/layout";
/**
 * Top Bar, include title, timeController, upload/download btn
 */
export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { setMode } = useContext(LayoutContext) as layoutContext;

  return (
    <AppBar position="static" color="transparent">
      <Container maxWidth={false}>
        <Toolbar style={{ minHeight: "6vh" }}>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 10 }}>
            NTUEE Light Dance Editor
          </Typography>

          <LayoutButtons setMode={setMode} />

          <Settings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
