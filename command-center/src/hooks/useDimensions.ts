import { useState, useEffect } from "react";
import { useStdout } from "ink";
export default function useDimensions() {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState([stdout.columns, stdout.rows]);
  useEffect(() => {
    const handleResize = () => {
      setDimensions([stdout.columns, stdout.rows]);
    };
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);
  return dimensions;
}
