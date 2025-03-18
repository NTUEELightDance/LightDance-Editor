import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";
import { rpiTable } from "@/configs/rpiTable";

// Map the dancer to the RPi hostname
const dancerToRpi: Record<string, string> = {
  "0_durant": "lightdance-00",
  "1_hsieh": "lightdance-28", // NOTE
  "2_yuan": "lightdance-02",
  "3_ping": "lightdance-29",
  "4_wei": "lightdance-27", // NOTE
  "5_boyu": "lightdance-05",
  "6_yen": "lightdance-06",
  "7_samklin": "lightdance-07",
  "8_how": "lightdance-08",
  "9_staff": "lightdance-09",
  "10_shield": "lightdance-21", // NOTE
  "11_small_orb_1": "lightdance-11",
  "12_small_orb_2": "lightdance-12",
  "13_big_orb_left": "lightdance-13",
  "14_big_orb_right": "lightdance-14",
  "15_gun_1": "lightdance-15",
  "16_gun_2": "lightdance-16",
  "17_pillar_1": "lightdance-17",
  "18_pillar_2": "lightdance-18",
  "19_pillar_3": "lightdance-19",
  "20_pillar_4": "lightdance-20",
  "21_biochem_left": "lightdance-10", // NOTE
  "22_biochem_right": "lightdance-22",
  "23_small_magic": "lightdance-23",
  "24_big_magic_1": "lightdance-24",
  "25_big_magic_2": "lightdance-25",
  "26_saber": "lightdance-26",
};

// Record the RPi information according to MAC
const dancerTable: DancerData = Object.keys(dancerToRpi).reduce(
  (acc: DancerData, dancer) => {
    let rpiInfo = rpiTable[dancerToRpi[dancer]];
    acc[rpiInfo.MAC_WLAN] = {
      IP: rpiInfo.IP_WLAN ?? "192.168.0.0",
      MAC: rpiInfo.MAC_WLAN,
      dancer,
      hostname: dancerToRpi[dancer],
      connected: false,
      interface: "wifi",
    };
    acc[rpiInfo.MAC_ETHER] = {
      IP: rpiInfo.IP_ETHER ?? "192.168.0.0",
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
