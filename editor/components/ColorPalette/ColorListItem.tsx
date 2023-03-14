import {
  Paper,
  ListItem,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Color, ColorID } from "@/core/models";

function ColorListItem({
  color,
  handleEditClick,
  handleDeleteColor,
  protect = false,
}: {
  color: Color;
  handleEditClick: (color: ColorID) => () => void;
  handleDeleteColor: (color: ColorID) => void;
  protect?: boolean;
}) {
  return (
    <ListItem>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          alignItems: "center",
          gridAutoColumns: "1fr",
          gridAutoFlow: "column",
          placeItems: "center",
        }}
      >
        <Typography sx={{ width: "3rem" }}>{color.name}</Typography>
        <Paper
          sx={{
            backgroundColor: color.colorCode,
            display: "flex",
            width: "6rem",
            p: "0.5rem",
            height: "2.5em",
            justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          {color.colorCode}
        </Paper>
        <Box>
          {protect ? (
            <>
              <Tooltip title="this is a reserved color">
                <span>
                  <IconButton disabled>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="this is a reserved color">
                <span>
                  <IconButton disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          ) : (
            <>
              <IconButton onClick={handleEditClick(color.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleDeleteColor(color.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    </ListItem>
  );
}

export default ColorListItem;
