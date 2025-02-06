import React, { useContext, useState } from "react";
import { DancerData } from "../types/api.js";

const dancerTemplate: {
  IP: string;
  MAC: string;
  dancer: string;
  hostname: string;
  connected: boolean;
  interface: "wifi" | "ethernet";
} = {
  IP: "000.000.000.",
  MAC: "00:00:00:00:00:",
  dancer: "Dancer ",
  hostname: "hostname",
  connected: true,
  interface: "wifi",
};

const TestDancerData: DancerData = Array.from({ length: 10 }, (_, i) => ({
  ...dancerTemplate,
  IP: `${dancerTemplate.IP}${i}`,
  MAC: `${dancerTemplate.MAC}${i}`,
  dancer: `${dancerTemplate.dancer}${i}`,
  hostname: `${dancerTemplate.hostname}${i}`,
})).reduce((acc: DancerData, dancer, index) => {
  acc[index] = dancer;
  return acc;
}, {});

const DancerContext = React.createContext<{
  dancers: DancerData;
  setDancers: (dancers: DancerData) => void;
}>({
  dancers: {},
  setDancers: () => {},
});

export const DancerProvider = (props: React.PropsWithChildren) => {
  const [dancers, setDancers] = useState(TestDancerData);
  return (
    <DancerContext.Provider value={{ dancers, setDancers }}>
      {props.children}
    </DancerContext.Provider>
  );
};

export const useDancer = () => {
  const context = useContext(DancerContext);
  if (!context) {
    throw new Error("useDancer must be used within a DancerProvider");
  }
  return context;
};
