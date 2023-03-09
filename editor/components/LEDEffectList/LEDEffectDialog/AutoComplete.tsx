// mui
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// state
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import type { LEDMap } from "@/core/models";

interface LedEffectOptionType {
  inputValue?: string;
  partName: string;
  LEDEffectName: string;
}

const filter = createFilterOptions<LedEffectOptionType>();

export default function FreeSoloCreateOption() {
  const [value, setValue] = useState<LedEffectOptionType | null>(null);

  const ledMap: LEDMap = useReactiveVar(reactiveState.ledMap);

  const LedEffectOptions: LedEffectOptionType[] = [];
  Object.entries(ledMap).forEach(([partName, LEDEffects]) => {
    Object.keys(LEDEffects).forEach((LEDEffect) => {
      LedEffectOptions.push({
        partName: partName,
        LEDEffectName: LEDEffect,
      });
    });
  });

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          setValue({
            LEDEffectName: newValue,
            partName: "New Effect",
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            LEDEffectName: newValue.inputValue,
            partName: "New Effect",
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.LEDEffectName
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            LEDEffectName: `Add "${inputValue}"`,
            partName: "New Effect",
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={LedEffectOptions}
      groupBy={(option) => option.partName}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.LEDEffectName;
      }}
      renderOption={(props, option) => (
        <li {...props}>{option.LEDEffectName}</li>
      )}
      sx={{ width: "70%" }}
      freeSolo
      renderInput={(params) => <TextField {...params} label="Effect Name*" />}
    />
  );
}
