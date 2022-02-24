import { useRef, useState, useEffect } from "react";
import { useSelect } from "@mui/base";
import { Paper, Box, ClickAwayListener } from "@mui/material";
import { Root, Toggle, Listbox } from "./CustomComponents";

import useColorMap from "../../../hooks/useColorMap";

const CustomSelect = ({
  placeholder,
  onChange,
  currentColorName,
}: {
  placeholder?: string;
  onChange: (value: any) => void;
  currentColorName: string;
}) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [listboxVisible, setListboxVisible] = useState(false);
  const { colorMap } = useColorMap();

  const options: { label: string; value: string }[] = [];
  Object.keys(colorMap).forEach((colorName) => {
    options.push({ label: colorName, value: colorName });
  });

  // use color name as state
  const {
    getButtonProps,
    getListboxProps,
    getOptionProps,
    value: colorName,
  } = useSelect({
    listboxRef,
    options,
    defaultValue: currentColorName,
  });

  useEffect(() => {
    onChange(colorName);
  }, [colorName]);

  useEffect(() => {
    if (listboxVisible) listboxRef.current?.focus();
  }, [listboxVisible]);

  return (
    <ClickAwayListener onClickAway={() => setListboxVisible(false)}>
      <Root onClick={() => setListboxVisible(!listboxVisible)}>
        <Toggle
          {...getButtonProps()}
          style={{ "--color": colorMap[currentColorName] } as any}
        >
          {currentColorName ?? (
            <span className="placeholder">{placeholder ?? " "}</span>
          )}
        </Toggle>
        <Listbox
          {...getListboxProps()}
          className={listboxVisible ? "" : "hidden"}
        >
          {options.map((option) => (
            <li key={option.label} {...getOptionProps(option)}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {option.label}
                <Paper
                  sx={{
                    backgroundColor: colorMap[option.label],
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                  }}
                />
              </Box>
            </li>
          ))}
        </Listbox>
      </Root>
    </ClickAwayListener>
  );
};

export default CustomSelect;
