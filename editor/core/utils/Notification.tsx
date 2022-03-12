import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Button, Fade } from "@mui/material";

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";

// @ts-ignore
import styles from "./notification.module.css";
import { useHotkeys } from "react-hotkeys-hook";

type MessageType = "info" | "success" | "error" | "warning";

const Notification = ({
  type = "info",
  content,
}: {
  type: MessageType;
  content: string;
}) => {
  return (
    <Alert severity={type} variant="filled">
      {content}
    </Alert>
  );
};

const Confirmation = ({
  type = "info",
  content,
}: {
  type: MessageType;
  content: string;
}) => {
  const [open, setOpen] = useState(true);

  const handleConfirm = () => {
    ConfirmationSwal.clickConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    ConfirmationSwal.clickCancel();
    setOpen(false);
  };

  useHotkeys("enter", (e) => {
    e.preventDefault();
    ConfirmationSwal.clickConfirm();
  });

  return (
    <Fade in={open}>
      <Alert
        severity={type}
        variant="filled"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </>
        }
      >
        {content}
      </Alert>
    </Fade>
  );
};

// get swal notification manager with react integration
const NotificationSwal = withReactContent(Swal);
const notify = (type: MessageType) => (content: string) => {
  // mount the node passed to html to the dom with some animation
  NotificationSwal.fire({
    html: <Notification type={type} content={content} />,
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 4000,
    background: "transparent",
  });
};

// get swal notification manager with react integration
const ConfirmationSwal = withReactContent(Swal);
const confirm = (type: MessageType) => async (content: string) => {
  // mount the node passed to html to the dom with some animation
  const { isConfirmed } = await ConfirmationSwal.fire({
    html: <Confirmation type={type} content={content} />,
    position: "top",
    background: "transparent",
    // we have to set showConfirmButton to true to get Enter confirm working
    showConfirmButton: true,
    // we are make the button invisible, but still displaying
    confirmButtonText: "",
    buttonsStyling: false,
    customClass: {
      confirmButton: styles.invisible,
    },
  });

  return isConfirmed;
};

export const notification = {
  info: notify("info"),
  success: notify("success"),
  error: notify("error"),
  warning: notify("warning"),
};

export const confirmation = {
  info: confirm("info"),
  success: confirm("success"),
  error: confirm("error"),
  warning: confirm("warning"),
};
