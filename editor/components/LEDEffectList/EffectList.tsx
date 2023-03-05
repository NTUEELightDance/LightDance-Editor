import { useState } from "react";
import _ from "lodash";

// mui
import {
  List,
  ListItem,
  Stack,
  ListItemText,
  Tooltip,
  IconButton,
  Divider,
  ListItemSecondaryAction,
  ListItemButton,
  Typography,
  ListSubheader,
  ListItemIcon,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";

// state
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import store from "../../store";

export default function EffectList() {
  const ledMap = useReactiveVar(reactiveState.ledMap);
  const { dancerMap } = store.getState().load;
  const dancers = useReactiveVar(reactiveState.dancers);

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
    // const ok = await confirmation.warning(
    //   `This will clear all frames from ${currentTime} to the end of the effect. Are you sure?`
    // );

    // if (ok) {
    //   applyEffect({
    //     payload: { start: currentTime, applyId: effectSelectedID },
    //   });
    // }

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
    //deleteEffect({ payload: effectSelectedPart });
    handleCloseDelete();
  };

  const reset = () => {
    // setEffectSelectedPart("");
    // setEffectSelectedName("");
    //setCollidedFrame([]);
  };

  // let modelList: string[] = [];
  // Object.keys(dancers).forEach((dancerName) => {
  //   modelList = _.union(modelList, [dancerMap[dancerName]["modelName"]]);
  // });
  // console.log(modelList);

  // const getModelByPart = (PartName: string) => {
  //   console.log(dancerMap);
  //   console.log(dancers);

  //   const modelName = Object.entries(dancerMap).find(
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     ([dancerName, dancerData]) => {
  //       return (
  //         (dancerData as { url: string; modelName: string })["modelName"] ===
  //         PartName
  //       );
  //     }
  //   );
  //   return modelName;
  // };

  return (
    <>
      <List>
        {Object.entries(ledMap).map(([PartName, LEDEffectData]) =>
          Object.keys(LEDEffectData).map((EffectName) => {
            const modelName = "";
            return (
              <>
                <ListItem key={EffectName}>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "20px", color: "white" }}>
                        {EffectName}
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
                          {PartName}
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
                          handleOpenApply(PartName, EffectName);
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
              </>
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
