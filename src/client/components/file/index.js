import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// mui
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

// select
import { selectLoad } from "../../slices/loadSlice";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// api
import { uploadImages } from "../../api";
// utils
import { checkControlJson, checkPosJson, checkImages } from "./utils";

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
  const { texture } = useSelector(selectLoad);
  const [toServer, setToServer] = useState(false);
  const [controlRecordFile, setControlRecordFile] = useState(null);
  const [posRecordFile, setPosRecordFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [path, setPath] = useState("");

  const handlePosInput = (e) => {
    // checkPosJson(e.target.files);
    setPosRecordFile(e.target.files);
  };
  const handleControlInput = (e) => {
    // checkControlJson(e.target.files);
    setControlRecordFile(e.target.files);
  };

  const handleImagesInput = (e) => {
    setSelectedImages(e.target.files);
  };

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };

  const handleUpload = () => {
    if (controlRecordFile) {
      checkControlJson(controlRecordFile);
      setControlRecordFile(undefined);
    }
    if (posRecordFile) {
      checkPosJson(posRecordFile);
      setPosRecordFile(undefined);
    }
    if (selectedImages && path) {
      checkImages(selectedImages, path);
      setSelectedImages(undefined);
      setPath("");
    }
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
          <input
            id="control"
            name="control"
            type="file"
            accept=".json"
            onChange={handleControlInput}
          />
        </div>
        <div>
          <Typography variant="h6" color="initial">
            Upload position.json
          </Typography>
          <input
            id="position"
            name="position"
            type="file"
            accept=".json"
            onChange={handlePosInput}
          />
        </div>
      </div>
      <div>
        <Typography variant="h6" color="initial">
          Upload [name].png (should select part)
        </Typography>

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
        <select value={path} onChange={handlePathChange}>
          {Object.keys(texture.LEDPARTS).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <br />
      <Divider />
      <br />
      <Button
        variant="outlined"
        color="default"
        onClick={() => {
          handleUpload();
        }}
      >
        Upload
      </Button>
      <Button variant="outlined" color="default">
        download
      </Button>
    </Container>
  );
}
