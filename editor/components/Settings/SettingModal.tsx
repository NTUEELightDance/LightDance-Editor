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
            display: "flex",
            width: "30vw",
            minWidth: "600px",
            mx: "auto",
            mt: "8vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              p: "5% 8%",
            }}
          >
            <IconButton
              style={{ transform: "translate(-20px, -10px)" }}
              onClick={onClose}
            >
              <CloseRoundedIcon />
            </IconButton>
            {children}
          </Paper>
        </Box>
      </Grow>
    </Modal>
  );
};
