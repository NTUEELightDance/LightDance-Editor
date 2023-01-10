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

export default function ColorPalette() {
  const { colorMap, handleAddColor, handleEditColor, handleDeleteColor } =
    useColorMap();

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const temp: Record<string, boolean> = {};
  Object.keys(colorMap).forEach((colorName) => (temp[colorName] = false));
  const [editDialogOpen, setEditDialogOpen] =
    useImmer<Record<string, boolean>>(temp);

  const handleEditClick = (color: string) => () => {
    setEditDialogOpen((editDialogOpen) => {
      editDialogOpen[color] = true;
    });
  };

  const protectedColors = ["blue", "red", "yellow"];
  const colorMapSorter = (
    [colorNameA, colorCodeA]: [colorNameA: string, colorCodeA: string],
    [colorNameB, colorCodeB]: [colorNameB: string, colorCodeB: string]
  ) => {
    if (
      protectedColors.includes(colorNameA) &&
      protectedColors.includes(colorNameB)
    ) {
      return colorNameA < colorNameB ? -1 : colorNameA > colorNameB ? 1 : 0;
    }

    if (protectedColors.includes(colorNameA)) return -1;
    if (protectedColors.includes(colorNameB)) return 1;

    return colorNameA < colorNameB ? -1 : colorNameA > colorNameB ? 1 : 0;
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
                .sort(colorMapSorter)
                .map(([colorName, colorCode]) => (
                  <Collapse key={`${colorName}_${colorCode}`}>
                    <ColorListItem
                      colorName={colorName}
                      colorCode={colorCode}
                      handleEditClick={handleEditClick}
                      handleDeleteColor={handleDeleteColor}
                      protect={protectedColors.includes(colorName)}
                    />
                  </Collapse>
                ))}
            </TransitionGroup>
          </List>
        </Stack>
      </Paper>

      <ColorDialog
        type="add"
        open={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
        handleMutateColor={handleAddColor}
      />

      {Object.entries(colorMap).map(([colorName, colorCode]) => (
        <ColorDialog
          type="edit"
          open={editDialogOpen[colorName]}
          handleClose={() => {
            setEditDialogOpen((editDialogOpen) => {
              editDialogOpen[colorName] = false;
            });
          }}
          handleMutateColor={async (newColorName, newColorCode) => {
            await handleEditColor(colorName, newColorName, newColorCode);
          }}
          defaultColorName={colorName}
          defaultColorCode={colorCode}
          disableNameChange={protectedColors.includes(colorName)}
          key={`${colorName}_${colorCode}`}
        />
      ))}
    </>
  );
}
