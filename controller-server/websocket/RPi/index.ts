import { FromRPi } from "@/types/RPiMessage";
import { handleRpiBoardInfo, handleRPiResponse } from "./handlers";

export default function handleOnMessage(msg: FromRPi) {
  switch (msg.command) {
    case "boardInfo":
      handleRpiBoardInfo(msg);
      break;
    default:
      handleRPiResponse(msg);
      break;
  }
}
