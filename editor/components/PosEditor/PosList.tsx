// mui
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
// states and actions
import { useReactiveVar } from "@apollo/client";
import { setPosFrame } from "../../core/actions";
import { reactiveState } from "../../core/state";
// hooks
import usePos from "../../hooks/usePos";
// constants
import { POSEDITOR } from "../../constants";

export default function PosList() {
  const { loading, posMap, posRecord } = usePos();
  const { posFrame } = useReactiveVar(reactiveState.timeData);

  // select item, change posFrame
  const handleSelectItem = (idx: number) => {
    setPosFrame({
      payload: { from: POSEDITOR, posFrame: idx },
    });
  };
  if (loading) return null;
  return (
    <List component="nav">
      {posRecord.map((posId: string, idx: number) => (
        <ListItem
          // eslint-disable-next-line react/no-array-index-key
          key={`posItem_${idx}`}
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
