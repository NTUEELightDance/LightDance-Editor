import { controlAgent, posAgent, ledAgent } from "../../api";
import { reactiveState } from "core/state";

/**
 * Get [posMap, posRecord] from posAgent
 */
export async function getPos() {
  return await Promise.all([posAgent.getPosMap(), posAgent.getPosRecord()]);
}

/**
 * Get [controlMap, controlRecord] from controlAgent
 */
export async function getControl() {
  return await Promise.all([controlAgent.getControlMap(), controlAgent.getControlRecord()]);
}

/**
 * Get ledMap from ledAgent
 */
export async function getLedMap() {
  return await ledAgent.getLedMap();
}

/**
 * Get part's type from its name
 * should return
 */
export function getPartType(partName: string) {
  const partTypeMap = reactiveState.partTypeMap();
  return partTypeMap[partName];
}

export * from "./Notification";
export * from "./math";
export * from "./localStorage";
export * from "./color";
export * from "./fade";
export * from "./frame";
export * from "./led";
export * from "./genJson";
export * from "./timeFormat";
export * from "./log";