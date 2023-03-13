import {
  FromControlPanelBoardInfo,
  FromControlPanelPlay,
  FromControlPanelPause,
  FromControlPanelStop,
  FromControlPanelTest,
  FromControlPanelRed,
  FromControlPanelGreen,
  FromControlPanelBlue,
  FromControlPanelDarkAll,
} from "@/types/controlPanelMessage";

export function handleBoardInfo(msg: FromControlPanelBoardInfo) {
  console.log(msg);
}

export function handlePlay(msg: FromControlPanelPlay) {
  console.log(msg);
}

export function handlePause(msg: FromControlPanelPause) {
  console.log(msg);
}

export function handleStop(msg: FromControlPanelStop) {
  console.log(msg);
}

export function handleTest(msg: FromControlPanelTest) {
  console.log(msg);
}

export function handleRed(msg: FromControlPanelRed) {
  console.log(msg);
}

export function handleGreen(msg: FromControlPanelGreen) {
  console.log(msg);
}

export function handleBlue(msg: FromControlPanelBlue) {
  console.log(msg);
}

export function handleDarkAll(msg: FromControlPanelDarkAll) {
  console.log(msg);
}
