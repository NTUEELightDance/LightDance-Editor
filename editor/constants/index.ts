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
export const GROUP = "PART_GROUP";
// a no-effect source for led to do nothing
export const NO_EFFECT = "";

// COMMANDS
const SYNC = "sync";
const UPLOAD_LED = "uploadLed";
const UPLOAD_CONTROL = "uploadControl";
const START = "start";
const LOAD = "load";
const PLAY = "play";
const PAUSE = "pause";
const STOP = "stop";
const LIGTHCURRENTSTATUS = "lightCurrentStatus";
const KICK = "kick";
const SHUTDOWN = "shutdown";
const REBOOT = "reboot";
const TERMINATE = "terminate";
export const COMMANDS = {
  SYNC,
  UPLOAD_LED,
  UPLOAD_CONTROL,
  START,
  LOAD,
  PLAY,
  PAUSE,
  STOP,
  LIGTHCURRENTSTATUS,
  KICK,
  SHUTDOWN,
  REBOOT,
  TERMINATE,
};
