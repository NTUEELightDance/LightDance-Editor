// mui
import { useMemo } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// state
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import type { LEDMap, LEDPartName } from "@/core/models";

export interface LedEffectOptionType {
  inputValue?: string;
  partName: string;
  LEDEffectName: string;
}

interface TextFieldProps {
  chosenLEDPart: LEDPartName | null;
  handleChangeChosenModel: (newChosenModel: string) => void;
  handleChangeChosenLEDPart: (newChosenLEDPart: string) => void;
  setActionMode: (action: "IDLE" | "EDIT" | "ADD") => void;
  newEffect: LedEffectOptionType | null;
  setNewEffect: (newEffect: LedEffectOptionType | null) => void;
}

const filter = createFilterOptions<LedEffectOptionType>();

export default function EffectNameTextField({
  chosenLEDPart,
  handleChangeChosenModel,
  handleChangeChosenLEDPart,
  setActionMode,
  newEffect,
  setNewEffect,
}: TextFieldProps) {
  //const [value, setValue] = useState<LedEffectOptionType | null>(null);
  const ledMap: LEDMap = useReactiveVar(reactiveState.ledMap);

  const LedEffectOptions = useMemo<LedEffectOptionType[]>(() => {
    const tempLedEffectOptions: LedEffectOptionType[] = [];
    Object.entries(ledMap).forEach(([partName, LEDEffects]) => {
      Object.keys(LEDEffects).forEach((LEDEffect) => {
        tempLedEffectOptions.push({
          partName: partName,
          LEDEffectName: LEDEffect,
        });
      });
    });
    return tempLedEffectOptions;
  }, [ledMap]);

  const handleActionMode = (newValue: string | LedEffectOptionType | null) => {
    let isExisting = false;
    if (!newValue) {
      isExisting = false;
      setActionMode("IDLE");
      handleChangeChosenLEDPart("");
      handleChangeChosenModel("");
      return;
    } else {
      if (typeof newValue === "string") {
        // input typed by user will bo on type "string"
        isExisting = LedEffectOptions.some(
          (option) => newValue === option.LEDEffectName
        );
        // Auto choose the corresponding part
        if (isExisting) {
          Object.entries(ledMap).some(([partName, LEDEffects]) => {
            if (
              Object.keys(LEDEffects).some((LEDEffect) => {
                return newValue === LEDEffect;
              })
            ) {
              handleChangeChosenLEDPart(partName);
              return true;
            } else {
              return false;
            }
          });
          // Set edit mode
          setActionMode("EDIT");
        } else {
          handleChangeChosenLEDPart("");
          // Set edit mode
          setActionMode("ADD");
        }
      } else {
        isExisting = LedEffectOptions.some(
          // input selected by user will bo on type "LedEffectOptionType"
          (option) => newValue.LEDEffectName === option.LEDEffectName
        );
        // Auto choose the corresponding part
        handleChangeChosenLEDPart(newValue.partName);

        // Set edit mode
        if (isExisting) {
          setActionMode("EDIT");
        } else {
          setActionMode("ADD");
        }
      }
    }
  };

  return (
    <>
      <Autocomplete
        value={newEffect}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setNewEffect({
              LEDEffectName: newValue,
              partName: "New Effect",
            });
          } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setNewEffect({
              LEDEffectName: newValue.inputValue,
              partName: "New Effect",
            });
          } else {
            setNewEffect(newValue);
          }

          handleActionMode(newValue);
        }}
        blurOnSelect
        filterOptions={(options, params) => {
          let filtered = filter(options, params);

          // show effects of the chosen part first
          if (chosenLEDPart) {
            filtered.sort((a, b) => {
              if (a.partName === b.partName) {
                return 0;
              }

              if (a.partName === chosenLEDPart) {
                return -1;
              } else if (b.partName === chosenLEDPart) {
                return 1;
              }

              return 0;
            });
          }

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some(
            (option) =>
              inputValue === option.LEDEffectName &&
              option.partName === chosenLEDPart
          );

          if (inputValue !== "" && !isExisting) {
            filtered = [
              {
                inputValue,
                LEDEffectName: `Add "${inputValue}"`,
                partName: "New Effect",
              },
              ...filtered,
            ];
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
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
    </>
  );
}
