import { useRef, useState } from "react";

import { Typography, IconButton, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import File from "./File";
import Preference from "./Preference";
import { SettingModal } from "./SettingModal";

export function Settings({
  showSettings,
  setShowSettings,
}: {
  showSettings: boolean;
  setShowSettings: (showSettings: boolean) => void;
}) {
  const [fileModalOpen, setFileModalOpen] = useState<boolean>(false);
  const [prefModalOpen, setPrefModalOpen] = useState<boolean>(false);
  const menuAnchor = useRef<HTMLButtonElement>(null);

  const settings = [
    {
      label: "files",
      modalOpen: fileModalOpen,
      setModalOpen: setFileModalOpen,
      modalChildren: <File />,
    },
    {
      label: "preferences",
      modalOpen: prefModalOpen,
      setModalOpen: setPrefModalOpen,
      modalChildren: <Preference />,
    },
  ];

  const handleMenuItemClick =
    (setModalOpen: (showModal: boolean) => void) => () => {
      setModalOpen(true);
      setShowSettings(false);
    };

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
        {settings.map(({ label, setModalOpen }) => (
          <MenuItem
            key={`${label}_label`}
            onClick={handleMenuItemClick(setModalOpen)}
          >
            <Typography textAlign="center">{label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {settings.map(({ label, modalOpen, setModalOpen, modalChildren }) => (
        <SettingModal
          key={`${label}_modal`}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        >
          {modalChildren}
        </SettingModal>
      ))}
    </>
  );
}
