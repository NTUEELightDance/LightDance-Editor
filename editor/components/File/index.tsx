import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// mui
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";

// write record
import { posInit, controlInit, selectGlobal } from "../../slices/globalSlice";
// select
import { selectLoad } from "../../slices/loadSlice";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// api
import { uploadImages, requestDownload } from "../../api";
// utils
import {
  downloadEverything,
  checkControlJson,
  checkPosJson,
  uploadJson,
  downloadControlJson,
  downloadPos,
} from "./utils";

const useStyles = makeStyles({});

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
  const classes = useStyles();
  // upload to server
  const dispatch = useDispatch();
  const { texture } = useSelector(selectLoad);
  const { posRecord, posMap, controlRecord, controlMap } =
    useSelector(selectGlobal);
  const [toServer, setToServer] = useState(false);
  const [controlRecordFile, setControlRecordFile] = useState(null);
  const [controlMapFile, setControlMap] = useState(null);
  const [posRecordFile, setPosRecordFile] = useState(null);
  const [posMapFile, setPosMapFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [path, setPath] = useState("");

  const imagePrefix = Object.values(texture.LEDPARTS)[0].prefix;

  const handlePosRecordInput = (e) => {
    setPosRecordFile(e.target.files);
  };
  const handlePosMapInput = (e) => {
    setPosMapFile(e.target.files);
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
        setItem("controlRecord", JSON.stringify(controlRecord));
        setItem("controlMap", JSON.stringify(controlMap));
        dispatch(controlInit({ controlRecord, controlMap }));
      }
    } else alert(errorMessage);
  };

  const handlePosUpload = async () => {
    if (!posRecordFile || !posMapFile) {
      alert("Both posRecord and posMap files are required");
      return;
    }
    const posRecord = await uploadJson(posRecordFile);
    const posMap = await uploadJson(posMapFile);
    const { checkPass, errorMessage } = checkPosJson(posRecord, posMap);
    if (checkPass) {
      if (
        window.confirm("Check Pass! Are you sure to upload new Position file?")
      ) {
        setItem("posRecord", JSON.stringify(posRecord));
        setItem("posMap", JSON.stringify(posMap));
        dispatch(posInit({ posRecord, posMap }));
      }
    } else alert(errorMessage);
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
    <Container>
      <div>
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
        <div>
          <Typography variant="h6" color="initial">
            Upload control.json
          </Typography>
          <div style={{ display: "flex", alignItems: "normal" }}>
            <label htmlFor="control">controlRecord: </label>
            <input
              id="control"
              name="control"
              type="file"
              accept=".json"
              onChange={handleControlInput}
            />
          </div>
          <div style={{ display: "flex", alignItems: "normal" }}>
            <label htmlFor="controlMap">controlMap: </label>
            <input
              id="controlMap"
              name="controlMap"
              type="file"
              accept=".json"
              onChange={handleControlMapInput}
            />
            <Button
              variant="outlined"
              color="default"
              onClick={() => {
                handleControlUpload();
              }}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              color="default"
              onClick={() => {
                handleDownloadControl();
              }}
            >
              Download
            </Button>
          </div>
        </div>
        <div>
          <Typography variant="h6" color="initial">
            Upload posRecord.json
          </Typography>
          <div style={{ display: "flex", alignItems: "normal" }}>
            <label htmlFor="posRecord">posRecord: </label>
            <input
              id="posRecord"
              name="posRecord"
              type="file"
              accept=".json"
              onChange={handlePosRecordInput}
            />
          </div>
          <div style={{ display: "flex", alignItems: "normal" }}>
            <label htmlFor="posMap">posMap: </label>
            <input
              id="posMap"
              name="posMap"
              type="file"
              accept=".json"
              onChange={handlePosMapInput}
            />
            <Button
              variant="outlined"
              color="default"
              onClick={() => {
                handlePosUpload();
              }}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              color="default"
              onClick={() => {
                handleDownloadPos();
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Typography variant="h6" color="initial">
          Upload [name].png <strong>(should select part)</strong>
        </Typography>
        <div style={{ display: "flex", alignItems: "normal" }}>
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

          <TextField
            select
            value={path}
            variant="outlined"
            onChange={handlePathChange}
            size="small"
          >
            {Object.keys(texture.LEDPARTS).map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            color="default"
            onClick={() => {
              handleImagesUpload();
            }}
          >
            Upload
          </Button>
        </div>
      </div>

      <br />
      <Divider />
      <br />

      <Button
        variant="outlined"
        color="default"
        onClick={() => {
          handleDownloadEverything();
        }}
      >
        Download
      </Button>
    </Container>
  );
}
