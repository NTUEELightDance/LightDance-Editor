import EditIcon from "@mui/icons-material/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { setLasso } from "@/core/actions";
function LassoButton() {
  const [lassoValid, setLassoValid] = useState(false);
  return (
    <div style={{ position: "absolute", top: "16px", right: "100px" }}>
      <IconButton
        onClick={async () => {
          setLassoValid(!lassoValid);
          await setLasso();
        }}
      >
        {lassoValid ? <EditIcon /> : <EditOutlinedIcon />}
      </IconButton>
    </div>
  );
}

export default LassoButton;
