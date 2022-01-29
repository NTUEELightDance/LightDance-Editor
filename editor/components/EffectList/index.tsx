import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// actions and selectors
import {
  selectGlobal,
  setEffectRecordMap,
  setEffectStatusMap,
} from "slices/globalSlice";
import { selectLoad } from "slices/loadSlice";
import { getItem } from "utils/localStorage";

// mui materials
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import "./style.css";

export default function EffectList() {
  const dispatch = useDispatch();
  const { effectRecordMap: loadedEffectRecordMap } = useSelector(selectLoad); // load from default
  const { effectRecordMap } = useSelector(selectGlobal);
  const { effectStatusMap: loadedEffectStatusMap } = useSelector(selectLoad); // load from default
  const { effectStatusMap } = useSelector(selectGlobal);

  // initilize effectRecordMap and effectStatusMap
  useEffect(() => {
    if (!getItem("effectRecordMap")) {
      dispatch(setEffectRecordMap(loadedEffectRecordMap)); // set state with default
    } else {
      dispatch(
        setEffectRecordMap(JSON.parse(getItem("effectRecordMap") || ""))
      ); // set state with local storage value
    }
    if (!getItem("effectStatusMap")) {
      dispatch(setEffectStatusMap(loadedEffectStatusMap)); // set state with default
    } else {
      dispatch(
        setEffectStatusMap(JSON.parse(getItem("effectStatusMap") || ""))
      ); // set state with local storage value
    }
  }, []);

  const [effectSelected, setEffectSelected] = useState("");
  const [applyOpened, setApplyOpened] = useState(false);

  const handleOpenApply = (key) => {
    setEffectSelected(key);
    setApplyOpened(true);
  };

  const handleCloseApply = () => {
    setApplyOpened(false);
  };
  const handleApplyEffect = () => {
    // todo: global slice
    setApplyOpened(false);
  };

  return (
    <div>
      <List>
        {Object.entries(effectRecordMap).map(([key, value]) => (
          <>
            <React.Fragment key={key}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="apply">
                    <AddIcon
                      onClick={() => handleOpenApply(key)}
                      sx={{ color: "white" }}
                    />
                  </IconButton>
                }
                sx={{ paddingLeft: 0, paddingTop: 0, paddingBottom: 0 }}
              >
                <Box
                  sx={{
                    height: 76,
                    width: 106,
                    marginRight: "2%",
                  }}
                >
                  <img
                    width="106px"
                    height="76px"
                    className="static"
                    src="components/EffectList/cat.png"
                  />
                  <img
                    width="106px"
                    height="76px"
                    className="active"
                    src="components/EffectList/cat.gif"
                  />
                </Box>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "20px", color: "white" }}>
                      {key}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ fontSize: "10px", color: "white" }}>
                      Length: {value.length}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
            <Divider
              variant="inset"
              component="li"
              sx={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
            />
          </>
        ))}
        <Grid
          container
          justifyContent="center"
          sx={{
            width: "100%",
            minHeight: "80px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="outlined" startIcon={<AddIcon />}>
            Custom
          </Button>
        </Grid>
      </List>
      <Dialog
        open={applyOpened}
        sx={{ color: "white", backgroundColor: "black" }}
      >
        <DialogTitle>Apply Effect to Current Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure to apply effect "{effectSelected}" to current record?
            This will insert{" "}
            {effectRecordMap[effectSelected]
              ? effectRecordMap[effectSelected].length
              : 0}{" "}
            frame(s) to current time spot.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApply}>Cancel</Button>
          <Button autoFocus onClick={handleApplyEffect}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
