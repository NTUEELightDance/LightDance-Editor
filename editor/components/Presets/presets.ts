import type { ControlMapStatus, PosMapStatus } from "@/core/models";

import { isControlMapStatus, isPosMapStatus } from "@/core/models";

/**
 * LightPresets type
 */
export type LightPresetsType = LightPresetsElement[];
export interface LightPresetsElement {
  name: string; // ID named by user
  status: ControlMapStatus;
}

export function isLightPresetsElement(
  element: LightPresetsElement | PosPresetsElement
): element is LightPresetsElement {
  return (
    typeof (element as LightPresetsElement).name === "string" &&
    isControlMapStatus((element as LightPresetsElement).status)
  );
}

/**
 * PosPresets type
 */
export type PosPresetsType = PosPresetsElement[];
export interface PosPresetsElement {
  name: string;
  pos: PosMapStatus;
}

export function isPosPresetsElement(
  element: LightPresetsElement | PosPresetsElement
): element is PosPresetsElement {
  return (
    typeof (element as PosPresetsElement).name === "string" &&
    isPosMapStatus((element as PosPresetsElement).pos)
  );
}
