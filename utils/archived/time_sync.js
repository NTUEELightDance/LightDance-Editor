const dgram = require("dgram");
const udp_server = dgram.createSocket("udp4");

udp_server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  udp_server.close();
});

udp_server.on("message", (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

udp_server.on("listening", () => {
  const { port, family, address: ipaddr } = udp_server.address();
  console.log(`[Udp Server] Server is listening at port ${port}`);
  console.log(`[Udp Server] Server ip : ${ipaddr}`);
  console.log(`[Udp Server] Server is IP4/IP6 :  ${family}`);
});

udp_server.on("close", () => {
  console.log("[Udp Server] Socket is closed !");
});

udp_server.bind(123);
