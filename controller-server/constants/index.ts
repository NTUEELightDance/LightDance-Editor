// Command Type
enum ActionType {
  SYNC = "sync",
  UPLOAD_LED = "uploadLed",
  UPLOAD_OF = "uploadOf",
  UPLOAD = "upload",
  BOARDINFO = "boardInfo",
  DISCONNECT = "disconnect",
  // General Command
  COMMAND = "command",
}

enum CommandSubType {
  LOAD = "load",
  LIGTHCURRENTSTATUS = "lightCurrentStatus",
  KICK = "kick",
  PLAY = "play",
  PAUSE = "pause",
  STOP = "stop",
  SHUTDOWN = "shutDown",
  REBOOT = "reboot",
  TEST = "test",
  RED = "red",
  BLUE = "blue",
  GREEN = "green",
  STMINIT = "stmInit",
  DARKALL = "darkall",
  RESTARTCONTROLLER = "restartController",
}

export { ActionType, CommandSubType };
