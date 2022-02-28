import { useState } from "react";
import { useSelector } from "react-redux";
// mui
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {
  Stack,
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
// write record
import { selectGlobal } from "../../../slices/globalSlice";
// select
import { selectLoad } from "../../../slices/loadSlice";
// utils
import { setItem, getItem } from "../../../core/utils";
// api
import { uploadImages, requestDownload } from "../../../api";
// utils
import {
  uploadJson,
  downloadExportJson,
  uploadExportJson,
  checkExportJson,
} from "./utils";
import { UploadDownload } from "./UploadDownload";
import { files } from "jszip";

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
  const { texture } = useSelector(selectLoad);
  const [toServer, setToServer] = useState(false);
  const [exportFile, setExportFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [path, setPath] = useState("");

  const imagePrefix = Object.values(texture.LEDPARTS)[0].prefix;
  const handleExportFileInput = (e) => {
    setExportFile(e.target.files);
  };

  const handleImagesInput = (e) => {
    setSelectedImages(e.target.files);
  };

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };
  const handleExportFileUpload = async () => {
    if (!exportFile) {
      alert("Missing export.json");
      return;
    }
    const exportJson = await uploadJson(exportFile);
    if (!checkExportJson(exportJson)) return;
    uploadExportJson(exportJson);
  };
  const handleExportFileDownload = async () => {
    // downloadExportJson()
  };
  const handleImagesUpload = async () => {
    if (selectedImages && path) {
      uploadImages(selectedImages, path, imagePrefix);
      // setSelectedImages(undefined);
      // setPath("");
    }
  };
  const handleSwitchServer = () => setToServer(!toServer);
  // TODO: make upload and download functional
  return (
    <Stack spacing={3}>
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

      <Typography variant="h6">Upload export.json</Typography>

      <ItemWrapper>
        <div>
          <label htmlFor="export">export.json: </label>
          <input
            id="export"
            name="exportFile"
            type="file"
            accept=".json"
            onChange={handleExportFileInput}
          />
        </div>
      </ItemWrapper>

      <UploadDownload
        handleUpload={handleExportFileUpload}
        handleDownload={handleExportFileDownload}
      />

      <Typography variant="h6">
        Upload [name].png <strong>(should select part)</strong>
      </Typography>
      <ItemWrapper>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesInput}
        />
      </ItemWrapper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1vw",
        }}
      >
        <FormControl sx={{ width: "18em" }} focused>
          <InputLabel id="part-select-label">Part to upload</InputLabel>
          <Select
            labelId="part-select-label"
            value={path}
            label="Part to upload"
            onChange={handlePathChange}
          >
            {Object.keys(texture.LEDPARTS).map((name) => (
              <MenuItem key={name} value={name}>
                <Typography>{name}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" size="small" onClick={handleImagesUpload}>
          Upload
        </Button>
      </Box>

      <Divider />
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
        pr: "30%",
        gap: "1vh",
      }}
    >
      {children}
    </Box>
  );
};
