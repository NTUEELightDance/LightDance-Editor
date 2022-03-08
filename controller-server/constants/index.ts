// Command Type
enum CommandType {
  SYNC = "sync",
  UPLOAD_LED = "uploadLed",
  UPLOAD_CONTROL = "uploadControl",
  LOAD = "load",
  PLAY = "play",
  PAUSE = "pause",
  STOP = "stop",
  LIGTHCURRENTSTATUS = "lightCurrentStatus",
  KICK = "kick",
  SHUTDOWN = "shutDown",
  REBOOT = "reboot",
  BOARDINFO = "boardInfo",
  INIT = "init",
  TEST = "test"
}

export { CommandType };