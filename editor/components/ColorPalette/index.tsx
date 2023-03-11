import { useState } from "react";
import { useImmer } from "use-immer";

import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";

import AddIcon from "@mui/icons-material/Add";

import useColorMap from "hooks/useColorMap";

import ColorDialog from "./ColorDialog";
import ColorListItem from "./ColorListItem";
import { Color, ColorID } from "@/core/models";

const protectedColors: Color["name"][] = ["black"];

export default function ColorPalette() {
  const { colorMap, handleAddColor, handleEditColor, handleDeleteColor } =
    useColorMap();

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const temp: Record<string, boolean> = {};
  Object.keys(colorMap).forEach((colorName) => (temp[colorName] = false));
  const [editDialogOpen, setEditDialogOpen] =
    useImmer<Record<ColorID, boolean>>(temp);

  const handleEditClick = (colorID: number) => () => {
    setEditDialogOpen((editDialogOpen) => {
      editDialogOpen[colorID] = true;
    });
  };

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          minHeight: "100%",
        }}
      >
        <Stack justifyContent="begin">
          <Paper
            sx={{
              width: "100%",
              position: "relative",
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                px: "1em",
                width: "100%",
                position: "sticky",
                zIndex: 808,
              }}
            >
              <IconButton
                onClick={() => {
                  setAddDialogOpen(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>

          <List sx={{ minWidth: "100%" }}>
            <TransitionGroup>
              {Object.entries(colorMap)
                .map(([colorID, color]) => ({
                  ...color,
                  id: parseInt(colorID),
                }))
                .sort((colorA, colorB) =>
                  colorA.name < colorB.name
                    ? -1
                    : colorA.name > colorB.name
                    ? 1
                    : 0
                )
                .map((color) => (
                  <Collapse key={`${color.name}_${color.colorCode}`}>
                    <ColorListItem
                      color={color}
                      handleEditClick={handleEditClick}
                      handleDeleteColor={handleDeleteColor}
                      protect={protectedColors.includes(color.name)}
                    />
                  </Collapse>
                ))}
            </TransitionGroup>
          </List>
        </Stack>
      </Paper>

      <ColorDialog
        variant="add"
        open={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
        handleMutateColor={handleAddColor}
      />

      {Object.entries(colorMap)
        .map(([colorID, color]) => ({ ...color, id: parseInt(colorID) }))
        .sort((colorA, colorB) =>
          colorA.name < colorB.name ? -1 : colorA.name > colorB.name ? 1 : 0
        )
        .map((color) => (
          <ColorDialog
            key={`${color.name}_${color.colorCode}`}
            variant="edit"
            open={editDialogOpen[color.id]}
            handleClose={() => {
              setEditDialogOpen((editDialogOpen) => {
                editDialogOpen[color.id] = false;
              });
            }}
            handleMutateColor={handleEditColor}
            color={color}
          />
        ))}
    </>
  );
}
