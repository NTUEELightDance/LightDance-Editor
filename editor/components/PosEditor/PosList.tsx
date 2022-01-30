import React from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
// redux selector and actions
import { selectGlobal, setPosFrame } from "../../slices/globalSlice";
// components
// constants
import { POSEDITOR } from "../../constants";

export default function PosList() {
  const {
    timeData: { posFrame },
    posRecord,
    posMap,
  } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  // select item, change posFrame
  const handleSelectItem = (idx: number) => {
    dispatch(setPosFrame({ from: POSEDITOR, posFrame: idx }));
  };

  return (
    <List component="nav">
      {posRecord.map((posId, idx: number) => (
        <ListItem
          // eslint-disable-next-line react/no-array-index-key
          key={posId}
          selected={posFrame === idx}
          button
          onClick={() => handleSelectItem(idx)}
        >
          <Typography variant="body1" color="initial">
            [{idx}] time: {posMap[posId].start}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}
