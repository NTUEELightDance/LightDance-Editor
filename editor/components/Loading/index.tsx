// @ts-ignore
import styles from "./styles.module.css";
import { Box } from "@mui/material";

const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className={`${styles["ball-grid-beat"]} ${styles["ball-grid-pulse"]}`}
      >
        {[...Array(9).keys()].map((i) => (
          <div key={i} />
        ))}
      </div>
    </Box>
  );
};

export default Loading;
