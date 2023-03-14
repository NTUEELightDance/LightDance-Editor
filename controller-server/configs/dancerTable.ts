import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";

// Record the RPi information according to MAC
const dancerTable: DancerData = {
  "78:4F:43:8B:9E:C6": {
    IP: "192.168.0.44",
    MAC: "78:4F:43:8B:9E:C6",
    dancer: "6_stantheman",
    hostname: "lightdance-06",
    connected: false,
  },
};

export const dancerToMac: Record<string, MACAddress> = {};
Object.keys(dancerTable).forEach((MAC) => {
  const { dancer } = dancerTable[MAC];
  dancerToMac[dancer] = MAC;
});

// Validate the config file
DancerDataSchema.parse(dancerTable);
export default dancerTable;
