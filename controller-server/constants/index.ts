// Command Type
enum CommandType {
  SYNC = "sync",
  UPLOAD_LED = "uploadLed",
  UPLOAD_OF = "uploadOf",
  LOAD = "load",
  PLAY = "play",
  PAUSE = "pause",
  STOP = "stop",
  LIGTHCURRENTSTATUS = "lightCurrentStatus",
  KICK = "kick",
  SHUTDOWN = "shutDown",
  REBOOT = "reboot",
  BOARDINFO = "boardInfo",
  TEST = "test",
  DISCONNECT = "disconnect",
}

export { CommandType };
