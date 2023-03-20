import dgram from "dgram";
import * as dotenv from "dotenv";
dotenv.config();

function createNTPServer() {
  const NTPserver = dgram.createSocket("udp4");
  NTPserver.on("error", (err) => {
    console.error(`Server error:\n${err.stack}`);
    NTPserver.close();
  });

  NTPserver.on("message", (msg, rinfo) => {
    // send server's system time
    const sysTime = Date.now();
    console.log(`RPi should sync with ${sysTime}`);
    NTPserver.send(`${sysTime}`, rinfo.port, rinfo.address);
  });

  NTPserver.on("listening", () => {
    const { port, family, address: ipaddr } = NTPserver.address();
    console.log(`[UDP Server] NTP Server is listening at port ${port}`);
    console.log(`[UDP Server] NTP Server ip : ${ipaddr}`);
    console.log(`[UDP Server] NTP Server is IP4/IP6 :  ${family}\n`);
  });

  NTPserver.on("close", () => {
    console.log("[UDP Server] Socket is closed !");
  });

  NTPserver.bind(7122);
  return NTPserver;
}

export default createNTPServer;
