import { useRef, useState } from "react";

import { Typography, IconButton, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Hotkeys from "./Hotkeys";
import File from "./File";
import Preference from "./Preference";
import { SettingModal } from "./SettingModal";

import { logout } from "@/core/actions";

export function Settings({
  showSettings,
  setShowSettings,
}: {
  showSettings: boolean;
  setShowSettings: (showSettings: boolean) => void;
}) {
  const [hotkeysModalOpen, setHotkeysModalOpen] = useState<boolean>(false);
  const [fileModalOpen, setFileModalOpen] = useState<boolean>(false);
  const [prefModalOpen, setPrefModalOpen] = useState<boolean>(false);
  const menuAnchor = useRef<HTMLButtonElement>(null);

  const settings = [
    {
      label: "hotkeys",
      modalOpen: hotkeysModalOpen,
      handleClick: () => {
        setHotkeysModalOpen(true);
        setShowSettings(false);
      },
      handleClose: () => {
        setHotkeysModalOpen(false);
      },
      modalChildren: <Hotkeys />,
    },
    {
      label: "files",
      modalOpen: fileModalOpen,
      handleClick: () => {
        setFileModalOpen(true);
        setShowSettings(false);
      },
      handleClose: () => {
        setFileModalOpen(false);
      },
      modalChildren: <File />,
    },
    {
      label: "preferences",
      modalOpen: prefModalOpen,
      handleClick: () => {
        setPrefModalOpen(true);
        setShowSettings(false);
      },
      handleClose: () => {
        setPrefModalOpen(false);
      },
      modalChildren: <Preference />,
    },
    {
      label: "logout",
      handleClick: () => {
        logout();
      },
    },
  ];

  return (
    <>
      <IconButton
        onClick={() => {
          setShowSettings(!showSettings);
        }}
        ref={menuAnchor}
      >
        <SettingsIcon sx={{ color: "white" }} />
      </IconButton>
      <Menu
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
        anchorEl={menuAnchor.current}
        open={showSettings}
        onClose={() => {
          setShowSettings(false);
        }}
      >
        {settings.map(({ label, handleClick }) => (
          <MenuItem key={`${label}_label`} onClick={handleClick}>
            <Typography textAlign="center">{label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {settings
        .filter((e) => e.modalChildren)
        .map(({ label, modalOpen, handleClose, modalChildren }) => (
          <SettingModal
            key={`${label}_modal`}
            open={modalOpen ?? false}
            onClose={handleClose ?? (() => null)}
          >
            {modalChildren ?? <></>}
          </SettingModal>
        ))}
    </>
  );
}
