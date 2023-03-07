import { useState } from "react";
import _ from "lodash";
import ModelListItem from "./ModelListItem";

// mui
import {
  List,
  ListSubheader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// import state and type
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import store from "../../../store";
import { getPartType } from "core/utils";
import type { LEDMap } from "@/core/models";

export default function EffectList({ openDialog }: { openDialog: () => void }) {
  const ledMap = useReactiveVar(reactiveState.ledMap);
  const { dancerMap } = store.getState().load;
  const dancers = useReactiveVar(reactiveState.dancers);

  // States
  const [effectSelectedPart, setEffectSelectedPart] = useState<string>("");
  const [effectSelectedName, setEffectSelectedName] = useState<string>("");
  const [collidedFrame, setCollidedFrame] = useState<number[]>([]);
  const [applyOpened, setApplyOpened] = useState<boolean>(false); // open apply effect dialog
  const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog
  const [expanded, setExpanded] = useState<boolean>(false);

  // Handle functions
  const handleOpenApply = (PartName: string, EffectName: string) => {
    setEffectSelectedPart(PartName);
    setEffectSelectedName(EffectName);
    setApplyOpened(true);
  };

  const handleCloseApply = () => {
    setApplyOpened(false);
    reset();
  };

  //TODO
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

  //TODO
  const handleDeleteEffect = () => {
    //deleteEffect({ payload: effectSelectedPart });
    handleCloseDelete();
  };

  const handleExpanded = () => {
    setExpanded(!expanded);
  };

  //TODO
  const reset = () => {
    // setEffectSelectedPart("");
    // setEffectSelectedName("");
    //setCollidedFrame([]);
  };

  // *************************************************
  // Construct modelMap of the following format
  // {
  //   modelName: {
  //       LEDPart1: [LEDEffectList],
  //       LEDPart2: [LEDEffectLIst2]
  //   },
  // }

  const modelMap: Record<string, LEDMap> = {};

  let modelList: string[] = [];
  Object.keys(dancers).forEach((dancerName) => {
    modelList = _.union(modelList, [dancerMap[dancerName]["modelName"]]);
  });

  modelList.forEach((modelName: string) => {
    const dancer = Object.entries(dancerMap).find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([dancerName, dancerData]) => {
        return (
          (dancerData as { url: string; modelName: string })["modelName"] ===
          modelName
        );
      }
    );

    let LEDParts: string[] = [];
    if (dancer) {
      LEDParts = dancers[dancer[0]].filter((part) => {
        return getPartType(part) === "LED";
      });
    }

    LEDParts.forEach((LEDPart) => {
      Object.entries(ledMap).forEach(([PartName, LEDEffectData]) => {
        if (LEDPart === PartName) {
          const PartData = { [PartName]: LEDEffectData };
          modelMap[modelName] = { ...modelMap[modelName], ...PartData };
        }
      });
    });
  });

  // console.log("LEDMap");
  // console.log(ledMap);
  // console.log("DancerMap");
  // console.log(dancerMap);
  // console.log("Dancers");
  // console.log(dancers);
  // console.log("modelList");
  // console.log(modelList);
  // console.log("modelMap");
  // console.log(modelMap);

  // *************************************************

  // Return
  return (
    <>
      <List>
        <ListSubheader>
          <Grid
            container
            justifyContent="center"
            spacing={2}
            sx={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openDialog}
              >
                Effect
              </Button>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Switch onChange={handleExpanded} size="small" />}
                label="Expand"
                color="primary"
              />
            </Grid>
          </Grid>
        </ListSubheader>
        {Object.entries(modelMap).map(([modelName, modelData]) => (
          <ModelListItem
            modelName={modelName}
            modelData={modelData as LEDMap}
            key={modelName}
            handleOpenApply={handleOpenApply}
            handleOpenDelete={handleOpenDelete}
            expanded={expanded}
          ></ModelListItem>
        ))}
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
