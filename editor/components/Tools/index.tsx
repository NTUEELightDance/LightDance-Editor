import React, { useState } from "react";

// mui
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

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
    <div>
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
    </div>
  );
}
