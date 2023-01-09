import { Modal, Box, Paper, IconButton, Grow } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const SettingModal = ({
  children,
  open,
  onClose,
}: {
  children: JSX.Element | JSX.Element[];
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Grow in={open}>
        <Box
          sx={{
            position: "relative",
            width: "30vw",
            minWidth: "600px",
            mx: "auto",
            mt: "8vh",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: "0.5rem",
              left: "0.5rem",
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              p: "3rem",
              pb: "2rem",
            }}
          >
            {children}
          </Paper>
        </Box>
      </Grow>
    </Modal>
  );
};
