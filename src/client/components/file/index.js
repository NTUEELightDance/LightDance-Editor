import React, { useState, useEffect } from "react";
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
  const [toServer, setToServer] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleImagesInput = (e) => {
    setSelectedImages(e.target.files);
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
          <input type="file" />
        </div>
        <div>
          <Typography variant="h6" color="initial">
            Upload position.json
          </Typography>
          <input type="file" />
        </div>
      </div>
      <div>
        <Typography variant="h6" color="initial">
          Upload [name].png (should select part)
        </Typography>
        <form
          method="post"
          encType="multipart/form-data"
          action="/api/upload/images"
        >
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
          <div>
            <input type="submit" value="Upload!" />
          </div>
        </form>
      </div>
      <br />
      <Divider />
      <br />
      <Button
        variant="outlined"
        color="default"
        onClick={() => {
          console.log(selectedImages);
        }}
      >
        list selected files
      </Button>
      <Button variant="outlined" color="default">
        download
      </Button>
    </Container>
  );
}
