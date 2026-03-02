import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";
import { rpiTable } from "@/configs/rpiTable";

// Map the dancer to the RPi hostname
const dancerToRpi: Record<string, string> = {
  "0_liao": "lightdance-25",
  "1_lin": "lightdance-05",
  "2_feng": "lightdance-03",
  "3_chen": "lightdance-24",
  "4_roy": "lightdance-04",
  "5_chiu": "lightdance-01",
  "6_su": "lightdance-06",
  "7_li": "lightdance-30",
  "8_hsieh": "lightdance-08",
  "9_yang": "lightdance-09",
  "10_tsai": "lightdance-21",
  "11_luo": "lightdance-11",
  "12_coffin": "lightdance-12",
  "13_altar_top1": "lightdance-13",
  "14_altar_bottom1": "lightdance-14",
  "15_altar_top2": "lightdance-15",
  "16_altar_bottom2": "lightdance-16",
  "17_cross": "lightdance-17",
  "18_gem": "lightdance-18",
  "19_pole": "lightdance-19",
  "20_fireplace": "lightdance-10",
  "21_axe1": "lightdance-20",
  "22_axe2": "lightdance-22",
  "23_balcony": "lightdance-23",
  "24_gun": "lightdance-26",
  "25_staff1": "lightdance-27",
  "26_staff2": "lightdance-28",
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
