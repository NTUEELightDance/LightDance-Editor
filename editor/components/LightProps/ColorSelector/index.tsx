import { useRef, useState, useEffect, useMemo } from "react";
import { useSelect } from "@mui/base";
import { Paper, ClickAwayListener } from "@mui/material";
import { Root, Toggle, Listbox } from "./CustomComponents";

import useColorMap from "@/hooks/useColorMap";

export interface CustomSelectProps {
  placeholder?: string;
  onChange: (value: string) => void;
  currentColorName: string | null;
}

function CustomSelect({
  placeholder = "",
  onChange,
  currentColorName,
}: CustomSelectProps) {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [listboxVisible, setListboxVisible] = useState(false);
  const { colorMap } = useColorMap();

  const options = useMemo(
    () =>
      Object.keys(colorMap).map((colorName) => ({
        label: colorName,
        value: colorName,
      })),
    [colorMap]
  );

  // use color name as state
  const {
    getButtonProps,
    getListboxProps,
    getOptionProps,
    value: colorName,
  } = useSelect({
    listboxRef,
    options,
    value: currentColorName ?? "",
    onChange: (event) => {
      if (event === null) return;
      const target = event.target as HTMLElement;
      const colorName = (target.dataset.option ??
        target.parentElement!.dataset.option) as string;
      onChange(colorName);
    },
  });

  useEffect(() => {
    if (listboxVisible) listboxRef.current?.focus();
  }, [listboxVisible]);

  return (
    <ClickAwayListener
      onClickAway={() => {
        setListboxVisible(false);
      }}
    >
      <Root
        onClick={() => {
          setListboxVisible(!listboxVisible);
        }}
      >
        <Toggle
          {...getButtonProps()}
          // @ts-expect-error we need to set this style variable to change the color
          style={{ ...(colorName ? { "--color": colorMap[colorName] } : {}) }}
        >
          {currentColorName ?? placeholder}
        </Toggle>
        <Listbox
          {...getListboxProps()}
          className={listboxVisible ? "" : "hidden"}
        >
          {options.map((option) => (
            <li
              key={option.label}
              {...getOptionProps(option)}
              data-option={option.value}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <Paper
                  sx={{
                    backgroundColor: colorMap[option.label],
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                  }}
                />
              </span>
              <span style={{ marginLeft: "0.25rem" }}>{option.label}</span>
            </li>
          ))}
        </Listbox>
      </Root>
    </ClickAwayListener>
  );
}

export default CustomSelect;
