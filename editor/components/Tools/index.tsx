import React, { useState } from "react";

import { Button, Menu, MenuItem } from "@mui/material";

// components
import TimeShift from "./TimeShift";

export default function Tools() {
  // open or close menu
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // open timeShift
  const [openTimeShift, setOpenTimeShift] = useState(false);
  const handleOpenTimeShift = () => {
    setOpenTimeShift(true);
    handleClose();
  };
  const handleCloseTimeShift = () => {
    setOpenTimeShift(false);
  };
  return (
    <>
      <Button aria-haspopup="true" onClick={handleClick}>
        Tools
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleOpenTimeShift}>TimeShift</MenuItem>
        <MenuItem onClick={handleClose}>Merge</MenuItem>
      </Menu>
      <TimeShift open={openTimeShift} handleClose={handleCloseTimeShift} />
    </>
  );
}
