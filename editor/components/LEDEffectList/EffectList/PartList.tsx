import type { LEDMap } from "@/core/models";

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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface PartProps {
  modelData: LEDMap;
  handleOpenApply: (PartName: string, EffectName: string) => void;
  handleOpenDelete: (PartName: string, EffectName: string) => void;
}

export default function PartList({
  modelData,
  handleOpenApply,
  handleOpenDelete,
}: PartProps) {
  return (
    <>
      <List
        sx={{
          pl: 2,
          width: "100%",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "auto",
          maxHeight: 600,
          "& ul": { padding: 0 },
        }}
        subheader={<li />}
      >
        {Object.entries(modelData).map(([PartName, LEDEffectData]) => {
          return (
            <>
              <ListSubheader>{PartName}</ListSubheader>
              {Object.keys(LEDEffectData).map((EffectName, index) => {
                return (
                  <div key={index}>
                    <ListItem sx={{ pl: 4 }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: "20px", color: "white" }}>
                            {EffectName}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip
                          title="Apply Effect"
                          placement="top"
                          enterDelay={300}
                          enterNextDelay={300}
                          followCursor
                        >
                          <IconButton
                            edge="end"
                            aria-label="apply"
                            size="large"
                            onClick={() => {
                              handleOpenApply(PartName, EffectName);
                            }}
                          >
                            <AddIcon
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
                            size="large"
                            onClick={() => {
                              handleOpenDelete(PartName, EffectName);
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
            </>
          );
        })}
      </List>
    </>
  );
}
