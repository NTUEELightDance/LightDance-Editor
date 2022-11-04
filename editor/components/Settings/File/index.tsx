import { useState } from "react";
// mui
import {
  Stack,
  Box,
  Button,
  Typography,
} from "@mui/material";
// utils
import {
  downloadExportJson,
  uploadExportJson,
  checkExportJson,
  checkLedJson,
  downloadLedJson,
  uploadLedJson,
} from "./utils";
import { UploadDownload } from "./UploadDownload";
import { notification } from "core/utils";

export default function File() {
  // upload to server
  const [exportFile, setExportFile] = useState(null);
  const [ledFile, setledFile] = useState(null);

  const handleExportFileInput = (e) => {
    setExportFile(e.target.files);
  };
  const handleLedFileInput = (e) => {
    setledFile(e.target.files);
  };
  const handleExportFileUpload = async () => {
    if (!exportFile) {
      notification.error("Missing export.json");
      return;
    }
    if (!(await checkExportJson(exportFile))) return;
    uploadExportJson(exportFile);
  };
  const handleExportFileDownload = async () => {
    await downloadExportJson();
  };
  const handleLedFileUpload = async () => {
    if (!ledFile) {
      notification.error("Missing LED.json");
      return;
    }
    if (!(await checkLedJson(ledFile))) return;
    uploadLedJson(ledFile);
  };
  const handleLedFileDownload = async () => {
    await downloadLedJson();
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: "5% 8%",
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h6">Upload export.json</Typography>
        <ItemWrapper>
          <label htmlFor="export">
            <input
              id="export"
              name="exportFile"
              type="file"
              accept=".json"
              onChange={handleExportFileInput}
              style={{ display: "none" }}
            />
            <Button variant="contained" component="span">
              choose file
            </Button>
          </label>
          <UploadDownload
            handleUpload={handleExportFileUpload}
            handleDownload={handleExportFileDownload}
          />
        </ItemWrapper>
        <Typography variant="h6">Upload LED.json</Typography>
        <ItemWrapper>
          <label htmlFor="LED">
            <input
              id="LED"
              name="LEDfile"
              type="file"
              accept=".json"
              onChange={handleLedFileInput}
              style={{ display: "none" }}
            />
            <Button variant="contained" component="span">
              choose file
            </Button>
          </label>
          <UploadDownload
            handleUpload={handleLedFileUpload}
            handleDownload={handleLedFileDownload}
          />
        </ItemWrapper>
      </Stack>
    </Box>
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
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "end",
        gap: "4em",
      }}
    >
      {children}
    </Box>
  );
};
