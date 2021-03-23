const dgram = require("dgram");
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
      this.server.send(`${Date.now()}`, rinfo.port, rinfo.address);
    });

    this.server.on("listening", () => {
      const { port, family, address: ipaddr } = this.server.address();
      console.log(`[Udp Server] Server is listening at port ${port}`);
      console.log(`[Udp Server] Server ip : ${ipaddr}`);
      console.log(`[Udp Server] Server is IP4/IP6 :  ${family}`);
    });

    this.server.on("close", () => {
      console.log("[Udp Server] Socket is closed !");
    });

    this.server.bind(7122);
  };
}

module.exports = NtpServer;

// Usage
// const ntpServer = new NtpServer();
