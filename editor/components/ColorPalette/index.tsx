import { useState } from "react";
import { useImmer } from "use-immer";

import {
  Paper,
  List,
  ListItem,
  Typography,
  Box,
  Stack,
  IconButton,
  Collapse,
} from "@mui/material";
import { TransitionGroup } from "react-transition-group";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import useColorMap from "../../hooks/useColorMap";

import ColorDialog from "./ColorDialog";

export default function ColorPalette() {
  const { colorMap, handleAddColor, handleEditColor, handleDeleteColor } =
    useColorMap();

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const temp: { [key: string]: boolean } = {};
  Object.keys(colorMap).forEach((colorName) => (temp[colorName] = false));
  const [editDialogOpen, setEditDialogOpen] =
    useImmer<{ [key: string]: boolean }>(temp);

  const [edittedColor, setEdittedColor] = useState<string>("");

  const handleEditClick = (color: string) => () => {
    setEditDialogOpen((editDialogOpen) => {
      editDialogOpen[color] = true;
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
                zIndex: 8080,
              }}
            >
              <IconButton onClick={() => setAddDialogOpen(true)}>
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>

          <List sx={{ minWidth: "100%" }}>
            <TransitionGroup>
              {Object.entries(colorMap).map(([colorName, colorCode]) => (
                <Collapse key={`${colorName}_${colorCode}`}>
                  <ListItem>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "90%",
                        mx: "auto",
                      }}
                    >
                      <Box sx={{ width: "7em" }}>
                        <Typography>{colorName}</Typography>
                      </Box>
                      <Paper
                        sx={{
                          backgroundColor: colorCode,
                          display: "flex",
                          width: "8em",
                          mx: "1em",
                          p: "0.5em",
                          height: "2.5em",
                          justifyContent: "center",
                          fontSize: "1em",
                        }}
                      >
                        {colorCode}
                      </Paper>
                      <Box sx={{ width: "8em" }}>
                        <IconButton onClick={handleEditClick(colorName)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteColor(colorName)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                </Collapse>
              ))}
            </TransitionGroup>
          </List>
        </Stack>
      </Paper>

      <ColorDialog
        type="add"
        open={addDialogOpen}
        handleClose={() => setAddDialogOpen(false)}
        handleMutateColor={handleAddColor}
      />

      {Object.entries(colorMap).map(([colorName, colorCode]) => (
        <ColorDialog
          type="edit"
          open={editDialogOpen[colorName]}
          handleClose={() =>
            setEditDialogOpen((editDialogOpen) => {
              editDialogOpen[colorName] = false;
            })
          }
          handleMutateColor={(newColorName, newColorCode) =>
            handleEditColor(colorName, newColorName, newColorCode)
          }
          defaultColorName={colorName}
          defaultColorCode={colorCode}
          key={`${colorName}_${colorCode}`}
        />
      ))}
    </>
  );
}
