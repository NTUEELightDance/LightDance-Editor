import React from "react";

import { Typography, Box } from "@mui/material";
import TreeItem, {
  TreeItemContentProps,
  useTreeItem,
  TreeItemProps
} from "@mui/lab/TreeItem";
import { blue } from "@mui/material/colors";

import clsx from "clsx";

const DancerTreeItemContent = React.forwardRef(function CustomContent (
  props: TreeItemContentProps,
  ref
) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventSelection(event);
  };

  const handleExpansionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleExpansion(event);
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
        [classes.disabled]: disabled
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
      sx={{
        ":hover": {
          p: {
            color: blue[100]
          }
        }
      }}
    >
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
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

function DancerTreeItem(props: TreeItemProps) {
  return <TreeItem ContentComponent={DancerTreeItemContent} {...props} />;
}

export default DancerTreeItem;
