import { useRef, useState, useEffect, useMemo } from "react";
import { useSelect } from "@mui/base";
import { Paper, ClickAwayListener } from "@mui/material";
import { Root, Toggle, Listbox } from "./CustomComponents";

import useColorMap from "@/hooks/useColorMap";
import { ColorID } from "@/core/models";
import { getBlackColorID } from "@/core/utils";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import { startEditing } from "@/core/actions";

export interface CustomSelectProps {
  placeholder?: string;
  onChange: (value: ColorID|null) => void;
  currentColorID: ColorID | null;
}

function CustomSelect({
  placeholder = "",
  onChange,
  currentColorID,
}: CustomSelectProps) {
  const editorState = useReactiveVar(reactiveState.editorState);
  const listboxRef = useRef<HTMLUListElement>(null);
  const [listboxVisible, setListboxVisible] = useState(false);
  const { colorMap } = useColorMap();
  const blackID = getBlackColorID();

  const options = useMemo(() => {
    const emptyOption = { label: placeholder, value: null }; // "empty" option
    return [
      emptyOption,
      ...Object.values(colorMap).map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    ];
  }, [colorMap, placeholder]);
  // use color name as state
  const {
    getButtonProps,
    getListboxProps,
    getOptionProps,
    value: colorID,
  } = useSelect({
    listboxRef,
    options,
    value: currentColorID ?? null,
    onChange: async (event) => {
      if (event === null) return;
      if (editorState === "IDLE") await startEditing();
      const target = event.target as HTMLElement;
      const selectedOption = target.dataset.option ?? target.parentElement!.dataset.option;

      if (selectedOption === "empty") {
          // Handle the "empty" selection
          onChange(null);
      } else {
          // Handle other selections
          const colorID = selectedOption ?? blackID.toString();
          onChange(parseInt(colorID));
      }
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
                ...(colorID !== null ? { "--color": colorMap[colorID].colorCode } : {}),
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
              data-option={option.value !== null ? option.value : "empty"}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {option.value !== null ? (
                  <Paper
                    sx={{
                      backgroundColor: colorMap[option.value].colorCode,
                      display: "inline-block",
                      width: "1em",
                      height: "1em",
                    }}
                  />
                ) : (
                  <Paper
                    sx={{
                      backgroundColor: "#808080", //grey
                      display: "inline-block",
                      width: "1em",
                      height: "1em",
                    }}
                  />
                )}
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