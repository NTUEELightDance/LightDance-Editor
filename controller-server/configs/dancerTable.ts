import { MACAddress, DancerDataSchema, DancerData } from "@/schema/DancerData";

// Record the RPi information according to MAC
const dancerTable: DancerData = {
  "00:00:00:00:00:00": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:00",
    dancer: "1_hank",
    hostname: "lightdance-01",
    connected: false,
  },
  "00:00:00:00:00:01": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:01",
    dancer: "2_henning",
    hostname: "lightdance-02",
    connected: false,
  },
  "B8:27:EB:B9:32:66": {
    IP: "192.168.0.0",
    MAC: "B8:27:EB:B9:32:66",
    dancer: "3_hans",
    hostname: "lightdance-03",
    connected: false,
  },
  "00:00:00:00:00:03": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:03",
    dancer: "4_rayh",
    hostname: "lightdance-04",
    connected: false,
  },
  "00:00:00:00:00:04": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:04",
    dancer: "5_justin",
    hostname: "lightdance-05",
    connected: false,
  },
  "78:4F:43:8B:9E:C6": {
    IP: "192.168.0.44",
    MAC: "78:4F:43:8B:9E:C6",
    dancer: "6_stantheman",
    hostname: "lightdance-06",
    connected: false,
  },
  "00:00:00:00:00:06": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:06",
    dancer: "7_ken",
    hostname: "lightdance-07",
    connected: false,
  },
  "00:00:00:00:00:07": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:07",
    dancer: "8_samuel",
    hostname: "lightdance-08",
    connected: false,
  },
  "00:00:00:00:00:08": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:08",
    dancer: "9_alice",
    hostname: "lightdance-09",
    connected: false,
  },
  "00:00:00:00:00:09": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:09",
    dancer: "10_ttk",
    hostname: "lightdance-10",
    connected: false,
  },
  "00:00:00:00:00:0A": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0A",
    dancer: "11_cabinet_ken",
    hostname: "lightdance-11",
    connected: false,
  },
  "00:00:00:00:00:0B": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0B",
    dancer: "12_cabinet_ttk",
    hostname: "lightdance-12",
    connected: false,
  },
  "00:00:00:00:00:0C": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0C",
    dancer: "13_cabinet_samuel",
    hostname: "lightdance-13",
    connected: false,
  },
  "00:00:00:00:00:0D": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0D",
    dancer: "14_counter_left",
    hostname: "lightdance-14",
    connected: false,
  },
  "00:00:00:00:00:0E": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0E",
    dancer: "15_counter_right",
    hostname: "lightdance-15",
    connected: false,
  },
  "00:00:00:00:00:0F": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:0F",
    dancer: "16_scythe",
    hostname: "lightdance-16",
    connected: false,
  },
  "00:00:00:00:00:10": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:10",
    dancer: "17_signboard",
    hostname: "lightdance-17",
    connected: false,
  },
  "00:00:00:00:00:11": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:11",
    dancer: "18_umbrella_hank",
    hostname: "lightdance-18",
    connected: false,
  },
  "00:00:00:00:00:12": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:12",
    dancer: "19_umbrella_henning",
    hostname: "lightdance-19",
    connected: false,
  },
  "00:00:00:00:00:13": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:13",
    dancer: "20_umbrella_hans",
    hostname: "lightdance-20",
    connected: false,
  },
  "00:00:00:00:00:14": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:14",
    dancer: "21_umbrella_rayh",
    hostname: "lightdance-21",
    connected: false,
  },
  "00:00:00:00:00:15": {
    IP: "192.168.0.0",
    MAC: "00:00:00:00:00:15",
    dancer: "22_umbrella_justin",
    hostname: "lightdance-22",
    connected: false,
  },
};

// TODO handle two interfaces
export const dancerToMAC: Record<string, MACAddress> = {};
Object.keys(dancerTable).forEach((MAC) => {
  const { dancer } = dancerTable[MAC];
  dancerToMAC[dancer] = MAC;
});

// Validate the config file
DancerDataSchema.parse(dancerTable);
export default dancerTable;
