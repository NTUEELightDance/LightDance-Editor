import { useState } from "react";

import LEDDancerTree from "./LEDDancerTree";
import LEDPartList from "./LEDPartList";

function DancerTree() {
  const [allDancerPage, setAllDancerPage] = useState(true);
  const [name, setName] = useState("");
  const [part, setPart] = useState("");
  return allDancerPage ? (
    <LEDDancerTree
      setAllDancerPage={setAllDancerPage}
      setName={setName}
      setPart={setPart}
    ></LEDDancerTree>
  ) : (
    <LEDPartList
      name={name}
      part={part}
      setAllDancerPage={setAllDancerPage}
    ></LEDPartList>
  );
}

export default DancerTree;
