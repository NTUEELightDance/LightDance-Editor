import { Box, Button } from "@mui/material";

export function UploadDownload({
  handleUpload,
  handleDownload,
}: {
  handleUpload: () => Promise<void>;
  handleDownload: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1vw",
      }}
    >
      <Button variant="outlined" size="small" onClick={handleUpload}>
        Upload
      </Button>
      <Button variant="outlined" size="small" onClick={handleDownload}>
        Download
      </Button>
    </Box>
  );
}
