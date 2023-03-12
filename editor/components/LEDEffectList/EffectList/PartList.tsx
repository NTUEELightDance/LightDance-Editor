import type { LEDMap, LEDPartName } from "@/core/models";

import {
  List,
  ListItemText,
  ListSubheader,
  ListItem,
  Typography,
  ListItemSecondaryAction,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/Delete";

interface partProps {
  modelData: LEDMap;
  handleOpenEdit: (partName: LEDPartName, effectName: string) => void;
  handleOpenDelete: (partName: LEDPartName, effectName: string) => void;
}

export default function PartList({
  modelData,
  handleOpenEdit,
  handleOpenDelete,
}: partProps) {
  return (
    <>
      <List
        sx={{
          pl: 2,
          width: "100%",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "auto",
          "& ul": { padding: 0 },
        }}
        subheader={<li />}
      >
        {Object.entries(modelData).map(([partName, LEDEffectData]) => {
          return (
            <div key={partName}>
              <ListSubheader>{partName}</ListSubheader>
              {Object.keys(LEDEffectData).map((effectName, index) => {
                return (
                  <div key={index}>
                    <ListItem sx={{ pl: 4 }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: "20px", color: "white" }}>
                            {effectName}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip
                          title="Edit Effect"
                          placement="top"
                          enterDelay={300}
                          enterNextDelay={300}
                          followCursor
                        >
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            size="medium"
                            onClick={() => {
                              handleOpenEdit(
                                partName as LEDPartName,
                                effectName
                              );
                            }}
                          >
                            <EditRoundedIcon
                              fontSize="inherit"
                              sx={{ color: "white" }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title="Delete Effect"
                          placement="top"
                          enterDelay={300}
                          enterNextDelay={300}
                          followCursor
                        >
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            size="medium"
                            onClick={() => {
                              handleOpenDelete(
                                partName as LEDPartName,
                                effectName
                              );
                            }}
                          >
                            <DeleteIcon
                              fontSize="inherit"
                              sx={{ color: "white" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </div>
                );
              })}
            </div>
          );
        })}
      </List>
    </>
  );
}
