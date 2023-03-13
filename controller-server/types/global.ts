import { FromControlPanel } from "./controlPanelMessage";
import { FromRPi } from "./RPiMessage";

export type Message = FromControlPanel | FromRPi;
