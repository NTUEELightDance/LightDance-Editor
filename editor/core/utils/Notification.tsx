import { Alert } from "@mui/material";

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";

type MessageType = "info" | "success" | "error" | "warning";

export const Notification = ({
  type = "info",
  content,
}: {
  type: MessageType;
  content: string;
}) => <Alert severity={type}>{content}</Alert>;

// get swal notification manager with react integration
const MySwal = withReactContent(Swal);
const notify = (type: MessageType) => (content: string) => {
  // mount the node passed to html to the dom with some animation
  MySwal.fire({
    html: <Notification type={type} content={content} />,
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 4000,
    background: "transparent",
  });
};

export const notification = {
  info: notify("info"),
  success: notify("success"),
  error: notify("error"),
  warning: notify("warning"),
};
