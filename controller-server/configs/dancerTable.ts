import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";
import { rpiTable } from "@/configs/rpiTable";

// Map the dancer to the RPi hostname
const dancerToRpi: Record<string, string> = {
  "0_durant": "lightdance-00",
  "1_hsieh": "lightdance-01",
  "2_yuan": "lightdance-02",
  "3_ping": "lightdance-03",
  "4_wei": "lightdance-04",
  "5_boyu": "lightdance-05",
  "6_yen": "lightdance-06",
  "7_samklin": "lightdance-07",
  "8_how": "lightdance-08",
};

// Record the RPi information according to MAC
const dancerTable: DancerData = Object.keys(dancerToRpi).reduce(
  (acc: DancerData, dancer) => {
    let rpiInfo = rpiTable[dancerToRpi[dancer]];
    acc[rpiInfo.MAC_WLAN] = {
      IP: "192.168.0.0",
      MAC: rpiInfo.MAC_WLAN,
      dancer,
      hostname: dancerToRpi[dancer],
      connected: false,
      interface: "wifi",
    };
    acc[rpiInfo.MAC_ETHER] = {
      IP: "192.168.0.0",
      MAC: rpiInfo.MAC_ETHER,
      dancer,
      hostname: dancerToRpi[dancer],
      connected: false,
      interface: "ethernet",
    };
    return acc;
  },
  {},
);

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
