import { Modal, Box, Paper } from "@mui/material";

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
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          width: "30vw",
          mx: "auto",
          mt: "10vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "#202020",
            p: "5%",
          }}
        >
          {children}
        </Paper>
      </Box>
    </Modal>
  );
};
