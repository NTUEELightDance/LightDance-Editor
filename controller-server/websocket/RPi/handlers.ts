import { FromRPiBoardInfo, FromRPiResponse } from "@/types/RPiMessage";

export function handleRpiBoardInfo(msg: FromRPiBoardInfo) {
  console.log(`[BOARDINFO]: ${msg.payload.macaddr}\n`);
}

export function handleRPiResponse(msg: FromRPiResponse) {
  console.log(`[COMMAND]: ${msg.command}`);
  console.log(`${msg.status}`);
  console.log(`${msg.payload.message}\n`);
}
