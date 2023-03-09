import { useMemo, useState } from "react";
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
  const [editOpened, setEditOpened] = useState<boolean>(false); // open edit effect dialog
  const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog
  const [expanded, setExpanded] = useState<boolean>(false);

  // Handle functions
  const handleOpenEdit = (PartName: string, EffectName: string) => {
    setEffectSelectedPart(PartName);
    setEffectSelectedName(EffectName);
    setEditOpened(true);
  };

  const handleCloseEdit = () => {
    setEditOpened(false);
    reset();
  };

  //TODO
  const handleEditEffect = () => {
    // const ok = await confirmation.warning(
    //   `This will clear all frames from ${currentTime} to the end of the effect. Are you sure?`
    // );

    // if (ok) {
    //   editEffect({
    //     payload: { start: currentTime, editId: effectSelectedID },
    //   });
    // }

    handleCloseEdit();
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

  const modelMap = useMemo(() => {
    const tempModelMap: Record<string, LEDMap> = {};
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
            tempModelMap[modelName] = {
              ...tempModelMap[modelName],
              ...PartData,
            };
          }
        });
      });
    });
    return tempModelMap;
  }, [dancers, dancerMap, ledMap]);

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
            spacing={3}
            sx={{
              mb: 2,
              pb: 1,
              width: "110%",
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
            handleOpenEdit={handleOpenEdit}
            handleOpenDelete={handleOpenDelete}
            expanded={expanded}
          ></ModelListItem>
        ))}
      </List>
      <Dialog open={editOpened} onClose={handleCloseEdit}>
        <DialogTitle>Edit LED Effect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure to edit effect "{effectSelectedName}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button autoFocus onClick={handleEditEffect}>
            Edit
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
