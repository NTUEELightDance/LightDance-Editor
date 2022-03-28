// current editor
export const CONTROL_EDITOR = "CONTROL_EDITOR";
export const POS_EDITOR = "POS_EDITOR";
// editing mode
export const IDLE = "IDLE";
export const EDITING = "EDITING";
// selection modes
export const DANCER = "DANCER_MODE";
export const PART = "PART_MODE";
export const POSITION = "POSITION_MODE";
// part type
export const LED = "LED";
export const EL = "EL";
export const FIBER = "FIBER";
// local storage keys
export const GROUP = "local_storage_key_GROUP";
export const PREFERENCES = "local_storage_key_PREFERENCES";
// a no-effect source for led to do nothing
export const NO_EFFECT = "";

// COMMANDS
const SYNC = "sync";
const UPLOAD_LED = "uploadLed";
const UPLOAD_OF = "uploadOf";
const LOAD = "load";
const PLAY = "play";
const PAUSE = "pause";
const STOP = "stop";
const LIGTHCURRENTSTATUS = "lightCurrentStatus";
const KICK = "kick";
const SHUTDOWN = "shutDown";
const REBOOT = "reboot";
const INIT = "init";
const TEST = "test";

const RED = "red";
const BLUE = "blue";
const GREEN = "green";
const DARKALL = "darkall";
const STMINIT = "stmInit";
const RESTARTCONTROLLER = "restartController";

const NTHU_PLAY = "NTHU Play";
const NTHU_STOP = "NTHU Stop";
export const WEBSOCKETCLIENT = {
  CONTROLPANEL: "controlPanel",
  RPI: "rpi",
};
export const COMMANDS = {
  SYNC,
  UPLOAD_LED, // need payload
  UPLOAD_OF, // need payload
  LOAD,
  PLAY, // need payload
  PAUSE,
  STOP,
  LIGTHCURRENTSTATUS, // need payload
  KICK,
  SHUTDOWN,
  REBOOT,
  TEST, // need payload
  RED,
  BLUE,
  GREEN,
  NTHU_PLAY,
  DARKALL,
  STMINIT,
  RESTARTCONTROLLER,
  NTHU_STOP,
};
