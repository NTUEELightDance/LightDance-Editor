import { useRef, useState, useEffect, useMemo } from "react";
import { useSelect } from "@mui/base";
import { Paper, ClickAwayListener } from "@mui/material";
import { Root, Toggle, Listbox } from "./CustomComponents";

import useColorMap from "@/hooks/useColorMap";
import { ColorID } from "@/core/models";

export interface CustomSelectProps {
  placeholder?: string;
  onChange: (value: ColorID) => void;
  currentColorID: ColorID | null;
}

function CustomSelect({
  placeholder = "",
  onChange,
  currentColorID,
}: CustomSelectProps) {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [listboxVisible, setListboxVisible] = useState(false);
  const { colorMap } = useColorMap();

  const options = useMemo(() => {
    console.log("options", { colorMap });
    return Object.values(colorMap).map(({ name, id }) => ({
      label: name,
      value: id,
    }));
  }, [colorMap]);

  // use color name as state
  const {
    getButtonProps,
    getListboxProps,
    getOptionProps,
    value: colorID,
  } = useSelect({
    listboxRef,
    options,
    value: currentColorID ?? -1,
    onChange: (event) => {
      if (event === null) return;
      const target = event.target as HTMLElement;
      const colorID =
        target.dataset.option ?? target.parentElement!.dataset.option ?? "-1";
      onChange(parseInt(colorID));
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
          style={{
            ...(colorID ? { "--color": colorMap[colorID].colorCode } : {}),
          }}
        >
          {colorID !== null ? colorMap[colorID].name : placeholder}
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
                    backgroundColor: colorMap[option.value].colorCode,
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
