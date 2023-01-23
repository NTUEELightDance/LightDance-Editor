import { useLocation } from "react-router-dom";

export default function useMode() {
  const location = useLocation();
  const mode = location.pathname.split("/");
  if (mode[0] === "" || mode[0] === "editor") {
    return "editor";
  } else if (mode[0] === "command") {
    return "command";
  }
  return "unknown";
}
