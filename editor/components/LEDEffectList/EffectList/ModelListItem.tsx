import { useState } from "react";
import type { LEDMap } from "@/core/models";
import PartList from "./PartList";

import {
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";

interface ModelProps {
  modelName: string;
  modelData: LEDMap;
  handleOpenApply: (PartName: string, EffectName: string) => void;
  handleOpenDelete: (PartName: string, EffectName: string) => void;
}

export default function ModelListItem({
  modelName,
  modelData,
  handleOpenApply,
  handleOpenDelete,
}: ModelProps) {
  const [ListOpen, setListOpen] = useState(false);
  const handleClick = () => {
    setListOpen(!ListOpen);
  };
  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <EmojiPeopleIcon />
        </ListItemIcon>
        <ListItemText primary={modelName.toUpperCase()} />
        {ListOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={ListOpen} timeout="auto" unmountOnExit>
        <PartList
          modelData={modelData}
          handleOpenApply={handleOpenApply}
          handleOpenDelete={handleOpenDelete}
        />
      </Collapse>
    </>
  );
}
