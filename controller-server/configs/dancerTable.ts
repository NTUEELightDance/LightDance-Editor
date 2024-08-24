import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";

// Record the RPi information according to MAC
const dancerTable: DancerData = {
  "B8:27:EB:82:79:49": {
    IP: "192.168.0.0",
    MAC: "B8:27:EB:82:79:49",
    dancer: "0_hjko",
    hostname: "lightdance-01",
    connected: false,
    interface: "ethernet",
  },
  "B8:27:EB:D7:2C:1C": {
    IP: "192.168.0.0",
    MAC: "B8:27:EB:D7:2C:1C",
    dancer: "0_hjko",
    hostname: "lightdance-01",
    connected: false,
    interface: "wifi",
  },
  "D8:3A:DD:22:AD:41": {
    IP: "192.168.0.0",
    MAC: "D8:3A:DD:22:AD:41",
    dancer: "1_sauby",
    hostname: "lightdance-14",
    connected: false,
    interface: "ethernet",
  },
  "D8:3A:DD:22:AD:43": {
    IP: "192.168.0.0",
    MAC: "D8:3A:DD:22:AD:43",
    dancer: "1_sauby",
    hostname: "lightdance-14",
    connected: false,
    interface: "wifi",
  },
  "D8:3A:DD:22:AC:FE": {
    IP: "192.168.0.0",
    MAC: "D8:3A:DD:22:AC:FE",
    dancer: "2_adam",
    hostname: "lightdance-11",
    connected: false,
    interface: "ethernet",
  },
  "D8:3A:DD:22:AC:FF": {
    IP: "192.168.0.0",
    MAC: "D8:3A:DD:22:AC:FF",
    dancer: "2_adam",
    hostname: "lightdance-11",
    connected: false,
    interface: "wifi",
  },
};

export const dancerToMAC: Record<
  string,
  { wifi: MACAddress; ethernet: MACAddress }
> = {};
Object.keys(dancerTable).forEach((MAC) => {
  const { dancer, interface: networkInterface } = dancerTable[MAC];
  dancerToMAC[dancer] ??= {
    wifi: "",
    ethernet: "",
  };
  dancerToMAC[dancer][networkInterface] = MAC;
});

// Validate the config file
DancerDataSchema.parse(dancerTable);
export default dancerTable;
