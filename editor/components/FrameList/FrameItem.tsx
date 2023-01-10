import { useRef, useEffect } from "react";
// mui
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import { formatDisplayedTime } from "core/utils";

export default function FrameItem ({
  idx,
  start,
  selected,
  handleSelectItem
}: {
  idx: number
  start: number
  selected: boolean
  handleSelectItem: (idx: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      ref?.current?.scrollIntoView({
        block: "center",
        inline: "nearest"
      });
    }
  }, [selected]);

  return (
    <div ref={ref}>
      <ListItem
        selected={selected}
        button
        onClick={() => { handleSelectItem(idx); }}
      >
        <Typography variant="body1">
          [{idx}] time: {formatDisplayedTime(start)}
        </Typography>
      </ListItem>
    </div>
  );
}
