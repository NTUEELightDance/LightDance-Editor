import { useState } from "react";

import { Typography, Box, IconButton, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import File from "./File";
import { SettingModal } from "./SettingModal";

export const Settings = ({
  showSettings,
  setShowSettings,
}: {
  showSettings: boolean;
  setShowSettings: (showSettings: boolean) => void;
}) => {
  const [fileModalOpen, setFileModalOpen] = useState<boolean>(false);

  const settings = [
    {
      label: "files",
      modalOpen: fileModalOpen,
      setModalOpen: setFileModalOpen,
      modalChildren: <File />,
    },
  ];

  const handleMenuItemClick =
    (setModalOpen: (showModal: boolean) => void) => () => {
      setModalOpen(true);
      setShowSettings(false);
    };

  return (
    <>
      <Box sx={{ position: "absolute", left: "95vw" }}>
        <IconButton
          sx={{ p: 0 }}
          onClick={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon sx={{ color: "white" }} />
        </IconButton>
        <Menu
          id="menu-appbar"
          sx={{ transform: "translate(-30px, 45px)" }}
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
          {settings.map(({ label, modalOpen, setModalOpen, modalChildren }) => (
            <>
              <MenuItem
                key={`${label}_label`}
                onClick={handleMenuItemClick(setModalOpen)}
              >
                <Typography textAlign="center">{label}</Typography>
              </MenuItem>
              <SettingModal
                key={`${label}_modal`}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
              >
                {modalChildren}
              </SettingModal>
            </>
          ))}
        </Menu>
      </Box>
    </>
  );
};
