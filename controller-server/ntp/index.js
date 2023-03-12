import dgram from "dgram";
class NtpServer {
  constructor() {
    this.server = dgram.createSocket("udp4");
    this.init();
  }
  init = () => {
    this.server.on("error", (err) => {
      console.error(`server error:\n${err.stack}`);
      this.server.close();
    });

    this.server.on("message", (msg, rinfo) => {
      // send server's system time
      const sysTime = Date.now();
      console.log(`RPi should sync with ${sysTime}`);
      this.server.send(`${sysTime}`, rinfo.port, rinfo.address);
    });

    this.server.on("listening", () => {
      const { port, family, address: ipaddr } = this.server.address();
      console.log(`[UDP Server] Server is listening at port ${port}`);
      console.log(`[UDP Server] Server ip : ${ipaddr}`);
      console.log(`[UDP Server] Server is IP4/IP6 :  ${family}`);
    });

    this.server.on("close", () => {
      console.log("[UDP Server] Socket is closed !");
    });

    this.server.bind(7122);
  };
}

export default NtpServer;
// Usage
// const ntpServer = new NtpServer();
