import { useState } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

/**
 * Top Bar, include title, timeController, upload/download btn
 */
export default function Header() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const pages = ["editor", "command center"];
  const settings = ["test"];
  return (
    <AppBar position="static" color="transparent">
      <Container maxWidth={false}>
        <Toolbar style={{ minHeight: "6vh" }}>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 10 }}>
            NTUEE Light Dance Editor
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", gap: "1vw" }}>
            {pages.map((page) => (
              <Button key={page} sx={{ color: "white", display: "block" }}>
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              sx={{ p: 0 }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <AccountCircleIcon fontSize="large" sx={{ color: "white" }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              sx={{ transform: "translate(-40px, 45px)" }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={showSettings}
              onClose={() => setShowSettings(false)}
            >
              {settings.map((setting) => (
                <MenuItem key={setting}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
