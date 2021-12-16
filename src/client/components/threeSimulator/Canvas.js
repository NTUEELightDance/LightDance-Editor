import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { selectGlobal } from "../../slices/globalSlice";

import useThree from "./hooks/useThree";
import Dancer from "./threeComponents/Dancer";

import {
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";

// actions
export default function Canvas() {
  const canvasRef = useRef();
  const { init, animate, scene } = useThree();
  const [dancers, setDancers] = useState(null);
  const { isPlaying, posRecord, timeData } = useSelector(selectGlobal);

  useEffect(() => {
    const canvas = canvasRef.current;
    init(canvas, [500, 500]);

    const dancer1 = new Dancer(scene);
    const dancer2 = new Dancer(scene);
    dancer1.addModel2Scene({ x: 3, y: 0, z: 0 });
    dancer2.addModel2Scene({ x: -3, y: 0, z: 0 });

    setDancers([dancer1, dancer2]);

    animate((clockDelta) => {
      dancer1.updateModel(clockDelta);
      dancer2.updateModel(clockDelta);
    });
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    if (dancers) {
      dancers.forEach((e) => {
        e.isPlaying = isPlaying;
        e.startTime = startTime;
      });
    }
  }, [isPlaying]);

  return <div ref={canvasRef} />;
}
