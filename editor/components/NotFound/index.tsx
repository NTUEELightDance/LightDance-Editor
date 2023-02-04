import Box from "@mui/material/Box";
import CircledXIcon from "@mui/icons-material/HighlightOff";

function NotFound() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center"
      }}
    >
      <CircledXIcon />
    </Box>
  );
}

export default NotFound;
