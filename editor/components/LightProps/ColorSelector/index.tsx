import { useRef, useState, useEffect } from "react";
import { useSelect } from "@mui/base";
import { Paper, Box } from "@mui/material";

import useColorMap from "../../../hooks/useColorMap";

import { Root, Toggle, Listbox } from "./CustomComponents";

const CustomSelect = ({
  placeholder,
  onChange,
}: {
  placeholder?: string;
  onChange: (value: any) => void;
}) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [listboxVisible, setListboxVisible] = useState(false);
  const { colorMap, addColor } = useColorMap();
  const [colorNameState, setColorNameState] = useState<string>("");

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
  });

  useEffect(() => {
    setColorNameState(colorName as string);
    onChange(colorMap[colorName as string]);
  }, [colorName]);

  useEffect(() => {
    if (listboxVisible) listboxRef.current?.focus();
  }, [listboxVisible]);

  return (
    <Root
      onMouseOver={() => setListboxVisible(true)}
      onMouseOut={() => setListboxVisible(false)}
      onFocus={() => setListboxVisible(true)}
      onBlur={() => setListboxVisible(false)}
    >
      <Toggle
        {...getButtonProps()}
        style={{ "--color": colorMap[colorNameState] } as any}
      >
        {colorNameState ?? (
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
  );
};

export default CustomSelect;
