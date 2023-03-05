import { Fragment, useState } from "react";

// mui
import {
  List,
  ListItem,
  ListItemText,
  Tooltip,
  IconButton,
  ListItemSecondaryAction,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// state
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

export default function EffectList() {
  const ledMap = useReactiveVar(reactiveState.ledMap);

  const [effectSelectedPart, setEffectSelectedPart] = useState<string>("");
  const [effectSelectedName, setEffectSelectedName] = useState<string>("");
  const [collidedFrame, setCollidedFrame] = useState<number[]>([]);
  const [applyOpened, setApplyOpened] = useState<boolean>(false); // open apply effect dialog
  const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog

  const handleOpenApply = (PartName: string, EffectName: string) => {
    setEffectSelectedPart(PartName);
    setEffectSelectedName(EffectName);
    setApplyOpened(true);
  };

  const handleCloseApply = () => {
    setApplyOpened(false);
    reset();
  };

  const handleApplyEffect = () => {
    handleCloseApply();
  };

  const handleOpenDelete = (PartName: string, EffectName: string) => {
    setEffectSelectedPart(PartName);
    setEffectSelectedName(EffectName);
    setDeleteOpened(true);
  };
  const handleCloseDelete = () => {
    setDeleteOpened(false);
    reset();
  };
  const handleDeleteEffect = () => {
    handleCloseDelete();
  };

  const reset = () => {
    setEffectSelectedPart("");
    setEffectSelectedName("");
    setCollidedFrame([]);
  };

  return (
    <>
      <List>
        {Object.entries(ledMap).map(([partName, LEDEffectData]) =>
          Object.keys(LEDEffectData).map((effectName) => {
            const modelName = "";
            return (
              <Fragment key={`${partName} ${effectName}`}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "20px", color: "white" }}>
                        {effectName}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          sx={{ fontSize: "10px", color: "white" }}
                        >
                          {"Model: "}
                          {modelName}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          sx={{ fontSize: "10px", color: "white" }}
                        >
                          {"Part: "}
                          {partName}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Apply Effect" placement="top">
                      <IconButton
                        edge="end"
                        aria-label="apply"
                        size="large"
                        onClick={() => {
                          handleOpenApply(partName, effectName);
                        }}
                      >
                        <AddIcon fontSize="inherit" sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Effect" placement="top">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="large"
                        onClick={() => {
                          handleOpenDelete(partName, effectName);
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
              </Fragment>
            );
          })
        )}
      </List>
      <Dialog open={applyOpened} onClose={handleCloseApply}>
        <DialogTitle>Apply LED Effect to Current Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* This will insert {effectRecordMap[effectSelected] ? effectRecordMap[effectSelected].length : 0}{" "}
                        frame(s) to current time spot.{" "} */}
            {collidedFrame.length > 0 ? (
              <span>
                The following frame(s) will be collided:
                {collidedFrame?.map((frame) => (
                  <span style={{ color: "#ba000d" }} key={frame}>
                    {frame}
                  </span>
                ))}
              </span>
            ) : (
              ""
            )}
            <br />
            Are you sure to apply effect "{effectSelectedName}" to current
            record ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApply}>Cancel</Button>
          <Button autoFocus onClick={handleApplyEffect}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpened} onClose={handleCloseDelete}>
        <DialogTitle>Delete LED Effect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure to delete LED effect "{effectSelectedName}" on "
            {effectSelectedPart}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button autoFocus onClick={handleDeleteEffect}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
