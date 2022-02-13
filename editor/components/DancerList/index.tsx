import { Typography } from "@mui/material";
// hooks
import useDancer from "hooks/useDancer";

const DancerList = () => {
  const { loading, error, dancerNames, dancers, partTypeMap, getPartType } =
    useDancer();
  console.log(dancerNames, dancers, partTypeMap);

  if (loading) return null;
  return (
    <>
      <Typography>DancerList</Typography>
    </>
  );
};

export default DancerList;
