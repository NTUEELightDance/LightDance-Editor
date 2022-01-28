import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// mui
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { Stack, Box, Button, TextField, Typography } from "@mui/material";
// write record
import {
  posInit,
  controlInit,
  selectGlobal,
} from "../../../slices/globalSlice";
// select
import { selectLoad } from "../../../slices/loadSlice";
// utils
import { setItem, getItem } from "../../../utils/localStorage";
// api
import { uploadImages, requestDownload } from "../../../api";
// utils
import {
  downloadEverything,
  checkControlJson,
  checkPosJson,
  uploadJson,
  downloadControlJson,
  downloadPos,
} from "./utils";
import { UploadDownload } from "./UploadDownload";

/**
 * Upload and download files
 * upload:
 * control.json -> need to ask update serverSide or not (Don't need to do this for testing)
 * position.json -> need to ask update serverSide or not (Don't need to do this for testing)
 * texture: [name].png -> update texture.json
 * download:
 * pack.tar.gz
 * |- asset/
 *      |- BlackPart
 *      |- LED
 *      |- Part
 * |- control.json
 * |- position.json
 * |- texture.json
 */
export default function File() {
  // upload to server
  const dispatch = useDispatch();
  const { texture } = useSelector(selectLoad);
  const { posRecord, controlRecord, controlMap } = useSelector(selectGlobal);
  const [toServer, setToServer] = useState(false);
  const [controlRecordFile, setControlRecordFile] = useState(null);
  const [controlMapFile, setControlMap] = useState(null);
  const [posRecordFile, setPosRecordFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [path, setPath] = useState("");

  const imagePrefix = Object.values(texture.LEDPARTS)[0].prefix;

  const handlePosInput = (e) => {
    // checkPosJson(e.target.files);
    setPosRecordFile(e.target.files);
  };
  const handleControlInput = (e) => {
    setControlRecordFile(e.target.files);
  };
  const handleControlMapInput = (e) => {
    setControlMap(e.target.files);
  };

  const handleImagesInput = (e) => {
    setSelectedImages(e.target.files);
  };

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };

  const handleControlUpload = async () => {
    if (!controlRecordFile || !controlMapFile) {
      alert("Both controlRecord and controlMap files are required");
      return;
    }
    const controlRecord = await uploadJson(controlRecordFile);
    const controlMap = await uploadJson(controlMapFile);
    //Todo: check controlMap and controlRecord are matched
    const { checkPass, errorMessage } = checkControlJson(
      controlRecord,
      controlMap
    );
    if (checkPass) {
      if (
        window.confirm("Check Pass! Are you sure to upload new Control file ?")
      ) {
        setItem("control", JSON.stringify(controlRecord));
        setItem("controlMap", JSON.stringify(controlMap));
        dispatch(controlInit({ controlRecord, controlMap }));
      }
    } else alert(errorMessage);
  };

  const handlePosUpload = async () => {
    if (posRecordFile) {
      const position = await uploadJson(posRecordFile);
      if (checkPosJson(position)) {
        if (
          window.confirm(
            "Check Pass! Are you sure to upload new Position file?"
          )
        )
          setItem("position", JSON.stringify(position));
        dispatch(posInit(position));
      } else alert("Pos: Wrong JSON format");
      // setPosRecordFile(undefined);
    }
  };
  const handleImagesUpload = async () => {
    if (selectedImages && path) {
      uploadImages(selectedImages, path, imagePrefix);
      // setSelectedImages(undefined);
      // setPath("");
    }
  };

  const handleDownloadControl = () => {
    downloadControlJson(controlRecord, controlMap);
  };

  const handleDownloadPos = () => {
    downloadPos(posRecord);
  };

  const handleDownloadEverything = () => {
    downloadEverything(controlRecord, controlMap, posRecord);
  };

  const handleSwitchServer = () => setToServer(!toServer);
  // TODO: make upload and download functional
  return (
    <Stack spacing={3} sx={{ color: "white" }}>
      <FormControlLabel
        control={
          <Switch
            checked={toServer}
            onChange={handleSwitchServer}
            name="switchServer"
          />
        }
        label="Upload to Server (Don't open this when testing)"
      />

      <Typography variant="h6">Upload control.json</Typography>

      <ItemWrapper>
        <div>
          <label htmlFor="control">controlRecord: </label>
          <input
            id="control"
            name="control"
            type="file"
            accept=".json"
            onChange={handleControlInput}
          />
        </div>
        <div>
          <label htmlFor="controlMap">controlMap: </label>
          <input
            id="controlMap"
            name="controlMap"
            type="file"
            accept=".json"
            onChange={handleControlMapInput}
          />
        </div>
      </ItemWrapper>

      <UploadDownload
        handleUpload={handleControlUpload}
        handleDownload={handleDownloadControl}
      />

      <Typography variant="h6">Upload position.json</Typography>
      <ItemWrapper>
        <input
          id="position"
          name="position"
          type="file"
          accept=".json"
          onChange={handlePosInput}
        />
      </ItemWrapper>

      <UploadDownload
        handleUpload={handlePosUpload}
        handleDownload={handleDownloadPos}
      />

      <Typography variant="h6">
        Upload [name].png <strong>(should select part)</strong>
      </Typography>
      <ItemWrapper>
        <div>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesInput}
          />
        </div>
      </ItemWrapper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1vw",
        }}
      >
        <TextField
          select
          value={path}
          variant="outlined"
          color="info"
          onChange={handlePathChange}
          size="small"
        >
          {Object.keys(texture.LEDPARTS).map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="outlined" onClick={handleImagesUpload}>
          Upload
        </Button>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", justifyContent: "center", px: "30%" }}>
        <Button
          variant="outlined"
          onClick={handleDownloadEverything}
          size="medium"
        >
          Download All
        </Button>
      </Box>
    </Stack>
  );
}

const ItemWrapper = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "end",
        pr: "40%",
        gap: "1vh",
      }}
    >
      {children}
    </Box>
  );
};
