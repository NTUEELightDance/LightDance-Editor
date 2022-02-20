import { useState } from "react";

import {
  Paper,
  List,
  ListItem,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import useColorMap from "../../hooks/useColorMap";

import ColorDialog from "./ColorDialog";

export default function ColorPalette() {
  const { colorMap, handleAddColor, handleEditColor, handleDeleteColor } =
    useColorMap();

  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [edittedColor, setEdittedColor] = useState<string>("");

  const handleEditClick = (color: string) => () => {
    setEdittedColor(color);
    setEditDialogOpen(true);
  };

  const handleEditColorWrapper = (
    newColorName: string,
    newColorCode: string
  ) => {
    handleEditColor(edittedColor, newColorName, newColorCode);
  };

  return (
    <>
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          minHeight: "100%",
        }}
      >
        <Paper sx={{ width: "100%" }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: "1em",
              position: "fixed",
              zIndex: 8080,
            }}
          >
            <IconButton onClick={() => setAddDialogOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Paper>

        <List sx={{ minWidth: "100%", mt: "2em" }}>
          {Object.entries(colorMap).map(([colorName, colorCode]) => (
            <ListItem key={`${colorName}_${colorCode}`}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "80%",
                  mx: "auto",
                }}
              >
                <Box sx={{ width: "8em" }}>
                  <Typography>{colorName}</Typography>
                </Box>
                <Paper
                  sx={{
                    backgroundColor: colorCode,
                    display: "inline-block",
                    mx: "2em",
                    p: "0.5em",
                  }}
                >
                  <Typography>{colorCode}</Typography>
                </Paper>
                <Box sx={{ width: "8em" }}>
                  <IconButton onClick={handleEditClick(colorName)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteColor(colorName)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      <ColorDialog
        type="add"
        open={addDialogOpen}
        handleClose={() => setAddDialogOpen(false)}
        handleMutateColor={handleAddColor}
      />
      <ColorDialog
        type="edit"
        open={editDialogOpen}
        handleClose={() => setEditDialogOpen(false)}
        handleMutateColor={handleEditColorWrapper}
      />
    </>
  );
}
