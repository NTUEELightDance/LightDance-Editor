import dgram from "dgram";
const SERVER_PORT = 7122;
const SERVER_IP = "0.0.0.0"; // should be changed

/**
 * NtpClient on RPi
 * @param cb { function } callback function
 */
class NtpClient {
  constructor(cb) {
    this.client = dgram.createSocket("udp4");
    this.timeData = {
      t0: null,
      t1: null,
      t2: null,
      t3: null,
    };
    this.init();
    this.cb = cb;
  }

  /**
   * initiate
   */
  init = () => {
    this.client.on("close", () => {
      console.log("socket closed");
    });
    this.client.on("error", (err) => {
      console.error(err);
    });
    this.client.on("message", (msg, rinfo) => {
      this.getMsg(msg, rinfo);
    });
  };

  /**
   * Start time syncing, to get t0 ~ t3
   */
  startTimeSync = () => {
    this.timeData.t0 = Date.now(); // client send time
    console.log("Start syncing ...", this.timeData);
    this.sendMsg(this.timeData);
  };

  /**
   * Set time
   * @param {} param0
   */
  setTime = (timeData) => {
    this.timeData.t1 = timeData.t1; // server receive time
    this.timeData.t2 = timeData.t2; // server send time
    this.timeData.t3 = Date.now(); // client receive time

    const { t0, t1, t2, t3 } = this.timeData;
    console.log(`t0: ${t0}, t1:${t1}, t2:${t2}, t3:${t3}`);
    // Check Type
    if (typeof t0 != "number") {
      console.error(`t0(${t0}) is not a number !`);
      return;
    }
    if (typeof t1 != "number") {
      console.error(`t0(${t1}) is not a number !`);
      return;
    }
    if (typeof t2 != "number") {
      console.error(`t0(${t2}) is not a number !`);
      return;
    }
    if (typeof t3 != "number") {
      console.error(`t0(${t3}) is not a number !`);
      return;
    }
    // Calculate time shift
    const rtt = Math.round((t3 - t0 - (t2 - t1)) / 2);
    const time = t2 + rtt;
    // TODO: set time
    this.cb(time);
  };

  /**
   * Get message from server server
   * message is a JSON containing timeData (t1, t2 is set by server)
   * @param {*} msg - array of number string (timestamp)
   * @param {*} rinfo
   */
  getMsg = (msg, rinfo) => {
    console.log(`receive ${msg} from ${rinfo.address}:${rinfo.port}`);
    this.setTime(JSON.parse(msg));
  };

  /**
   * Send message to ntp server
   * @param {*} msg
   */
  sendMsg = (msg) => {
    this.client.send(JSON.stringify(msg), SERVER_PORT, SERVER_IP);
  };
}

module.exports = NtpClient;

const ntpClient = new NtpClient((time) => {
  console.log(`Set to time ${time}`);
});

ntpClient.startTimeSync();
