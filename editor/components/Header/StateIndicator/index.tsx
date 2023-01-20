import { Zoom } from "@mui/material";

// @ts-expect-error (for importing css file)
import styles from "./styles.module.css";

import { EDITING } from "@/constants";
import { EditMode } from "core/models";

function EditorIndicator({ editMode }: { editMode: EditMode }) {
  return (
    <Zoom in={editMode === EDITING}>
      <div
        style={{
          width: "100vw",
          height: "0.8vh",
          overflow: "hidden",
          backgroundColor: "rgba(122, 247, 132, 0.3)",
        }}
      >
        <div className={styles.animatedCircle} style={circleStyles(0)} />
      </div>
    </Zoom>
  );
}

const circleStyles = (size: number) =>
  ({
    top: "0.5vh",
    left: "50vw",
    position: "relative",
    height: `${size}vw`,
    width: `${size}vw`,
    transform: `translate(-${size / 2}vw, -${size / 2}vw)`,
    backgroundColor: "rgba(188, 237, 243, 0.3)",
    borderRadius: "50%",
  } as React.CSSProperties);

export default EditorIndicator;
