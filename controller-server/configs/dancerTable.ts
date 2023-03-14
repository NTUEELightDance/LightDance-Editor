import {
  MACAddress,
  DancerDataSchema,
  DancerData,
} from "@/schema/DancerData";

// Record the RPi information according to MAC
const dancerTable: DancerData = {
  "00:00:00:00:00:00": {
    IP: "192.168.0.44",
    MAC: "00:00:00:00:00:00",
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
