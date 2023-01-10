import {
  Paper,
  ListItem,
  Typography,
  Box,
  IconButton,
  Tooltip
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function ColorListItem({
  colorName,
  colorCode,
  handleEditClick,
  handleDeleteColor,
  protect = false
}: {
  colorName: string
  colorCode: string
  handleEditClick: (color: string) => () => void
  handleDeleteColor: (color: string) => void
  protect?: boolean
}) {
  return (
    <ListItem>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "90%",
          mx: "auto"
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
            fontSize: "1em"
          }}
        >
          {colorCode}
        </Paper>
        <Box sx={{ width: "8em" }}>
          <IconButton onClick={handleEditClick(colorName)}>
            <EditIcon fontSize="small" />
          </IconButton>
          {protect
            ? (
              <Tooltip title="this is a reserved color">
                <span>
                  <IconButton disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )
            : (
              <IconButton onClick={() => { handleDeleteColor(colorName); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
        </Box>
      </Box>
    </ListItem>
  );
}

export default ColorListItem;
