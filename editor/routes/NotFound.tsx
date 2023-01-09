import { Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function NotFound() {
  return (
    <Paper
      square
      sx={{
        flexGrow: 1,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4em",
        }}
      >
        <Typography variant="h1" align="center">
          Error: Page Not Found
        </Typography>
        <Link
          to="/"
          style={{
            textDecoration: "none",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              transition: "color 0.2s ease-in-out",
              color: "text.secondary",
              textDecoration: "underline",
              ":hover": {
                color: "text.primary",
              }
            }}
          >
            Go Back to Editor
          </Typography>
        </Link>
      </Box>
    </Paper>
  );
}
