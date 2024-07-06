import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";

// Record the RPi information according to MAC
const dancerTable: DancerData = {
  "DC:A6:32:F4:48:5E": {
    IP: "192.168.0.0",
    MAC: "DC:A6:32:F4:48:5E",
    dancer: "0_hjko",
    hostname: "lightdance-01",
    connected: false,
    interface: "ethernet",
  },
  "DC:A6:32:F4:48:5F": {
    IP: "192.168.0.0",
    MAC: "DC:A6:32:F4:48:5F",
    dancer: "0_hjko",
    hostname: "lightdance-01",
    connected: false,
    interface: "wifi",
  },
  "E4:5F:01:B3:E6:8F": {
    IP: "192.168.0.0",
    MAC: "E4:5F:01:B3:E6:8F",
    dancer: "1_sauby",
    hostname: "lightdance-14",
    connected: false,
    interface: "ethernet",
  },
  "E4:5F:01:B3:E6:90": {
    IP: "192.168.0.0",
    MAC: "E4:5F:01:B3:E6:90",
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
