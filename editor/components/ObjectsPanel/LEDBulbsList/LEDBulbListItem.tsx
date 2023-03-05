import React from "react";

import { Typography, Box } from "@mui/material";
import TreeItem, {
  TreeItemContentProps,
  useTreeItem,
  TreeItemProps,
} from "@mui/lab/TreeItem";
import { blue } from "@mui/material/colors";

import clsx from "clsx";

const LEDBulbsListItemContent = React.forwardRef(function CustomContent(
  props: TreeItemContentProps,
  ref
) {
  const { classes, className, label, nodeId } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventSelection(event);
  };

  const handleSelectionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleSelection(event);
  };
  return (
    <Box
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
      sx={{
        ":hover": {
          p: {
            color: blue[100],
          },
        },
      }}
    >
      <Typography
        onClick={handleSelectionClick}
        className={classes.label}
        sx={{ p: "2px" }}
      >
        {label}
      </Typography>
    </Box>
  );
});

function LEDBulbsListItem(props: TreeItemProps) {
  return <TreeItem ContentComponent={LEDBulbsListItemContent} {...props} />;
}

export default LEDBulbsListItem;
