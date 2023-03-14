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
  Box,
  Switch,
  FormControlLabel,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// import state and type
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import store from "@/store";
import { getPartType, notification } from "core/utils";
import type { LEDMap, LEDPartName } from "@/core/models";
import { ledAgent } from "@/api";
import { renameLEDEffect } from "@/core/actions";

export default function LEDEffectList({
  openAddDialog,
  openEditDialog,
}: {
  openAddDialog: () => void;
  openEditDialog: (partName: LEDPartName, effectName: string) => void;
}) {
  const ledMap = useReactiveVar(reactiveState.ledMap);
  const { dancerMap } = store.getState().load;
  const dancers = useReactiveVar(reactiveState.dancers);

  // States
  const [effectSelectedPart, setEffectSelectedPart] =
    useState<LEDPartName | null>(null);
  const [effectSelectedName, setEffectSelectedName] = useState<string | null>(
    null
  );
  const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog
  const [renameOpened, setRenameOpened] = useState<boolean>(false); // open rename effect dialog
  const [expanded, setExpanded] = useState<boolean>(false);

  const [newEffectName, setNewEffectName] = useState<string>("");

  const handleOpenRename = (partName: LEDPartName, effectName: string) => {
    setEffectSelectedPart(partName);
    setEffectSelectedName(effectName);
    setRenameOpened(true);
  };

  const handleCloseRename = () => {
    setRenameOpened(false);
  };

  const handleRenameEffect = async () => {
    if (!effectSelectedPart || !effectSelectedName) return;

    const effectID = ledMap[effectSelectedPart][effectSelectedName]?.effectID;
    if (!effectID) return;

    await renameLEDEffect({
      payload: {
        effectID,
        newName: newEffectName,
      },
    });

    handleCloseRename();
  };

  const handleOpenDelete = (partName: LEDPartName, effectName: string) => {
    setEffectSelectedPart(partName);
    setEffectSelectedName(effectName);
    setDeleteOpened(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpened(false);
  };

  const handleDeleteEffect = async () => {
    if (!effectSelectedPart || !effectSelectedName) return;

    const effectID = ledMap[effectSelectedPart][effectSelectedName]?.effectID;

    if (!effectID) return;
    try {
      await ledAgent.deleteLEDEffect(effectID);
      notification.success("Delete effect successfully!");
    } catch (error) {
      if (error instanceof Error) {
        notification.error(error.message);
      }
      console.error(error);
    } finally {
      handleCloseDelete();
    }
  };

  const handleExpanded = () => {
    setExpanded(!expanded);
  };

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

  // Return
  return (
    <>
      <Paper
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <List>
          <ListSubheader component={Paper} sx={{ m: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
              }}
            >
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => openAddDialog()}
                >
                  Effect
                </Button>
              </Box>
              <Box>
                <FormControlLabel
                  control={<Switch onChange={handleExpanded} size="small" />}
                  label="Expand"
                  color="primary"
                />
              </Box>
            </Box>
          </ListSubheader>
          {Object.entries(modelMap).map(([modelName, modelData]) => (
            <ModelListItem
              modelName={modelName}
              modelData={modelData as LEDMap}
              key={modelName}
              handleOpenEdit={openEditDialog}
              handleOpenDelete={handleOpenDelete}
              handleOpenRename={handleOpenRename}
              expanded={expanded}
            />
          ))}
        </List>
      </Paper>
      <Dialog open={renameOpened} onClose={handleCloseRename}>
        <DialogTitle>Rename Effect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure to rename effect "{effectSelectedName}" ?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Effect Name"
            type="text"
            fullWidth
            value={newEffectName}
            onChange={(e) => setNewEffectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRename}>Cancel</Button>
          <Button autoFocus onClick={handleRenameEffect}>
            Rename
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
