import { useEffect, useState } from "react";
import { layoutType } from "types/layout";

export default function useLayout() {
  const [layout, setLayout] = useState<layoutType>("default");
  useEffect(() => {
    const StorageLayout = localStorage.getItem("layout");
    if (StorageLayout === null) {
      localStorage.setItem("layout", "default");
    } else {
      setLayout(StorageLayout as layoutType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("layout", layout);
  }, [layout]);

  return {
    layout,
    setLayout,
  };
}
