import { controlAgent, posAgent, ledAgent } from "@/api";
import { reactiveState, state } from "@/core/state";
import { ControlMap } from "../models";

/**
 * Get [posMap, posRecord] from posAgent
 */
export async function getPosPayload() {
  return await Promise.all([
    posAgent.getPosMapPayload(),
    posAgent.getPosRecord(),
  ]);
}

/**
 * Get [controlMap, controlRecord] from controlAgent
 */
export async function getControlPayload() {
  return await Promise.all([
    controlAgent.getControlMapPayload(),
    controlAgent.getControlRecord(),
  ]);
}

export async function getControl() {
  const results = await Promise.allSettled([
    controlAgent.getControlRecord(),
    controlAgent.getControlMapPayload(),
  ]);

  if (results[0].status === "rejected") {
    throw results[0].reason;
  }

  if (results[1].status === "rejected") {
    throw results[1].reason;
  }

  const controlRecord = results[0].value;

  // wait for the cache to update
  const waitForControlMap = async (retry = 0): Promise<ControlMap> => {
    if (
      retry > 0 &&
      controlRecord.length !== Object.keys(state.controlMap).length
    ) {
      // wait for some time
      await new Promise((resolve) => setTimeout(resolve, 50));
      return await waitForControlMap(retry - 1);
    }
    return state.controlMap;
  };

  const controlMap = await waitForControlMap(10);
  return [controlMap, controlRecord] as const;
}

export async function getPos() {
  await posAgent.getPosMapPayload();
  // the posMap is updated in the above line by merge function in cache
  const posMap = state.posMap;
  const posRecord = await posAgent.getPosRecord();
  return [posMap, posRecord] as const;
}

/**
 * Get ledMap from ledAgent
 */
export async function getLedMap() {
  await ledAgent.getLedMapPayload();
  // the ledMap is updated in the above line by merge function in cache
  const ledMap = state.ledMap;
  const ledEffectIDtable = state.LEDEffectIDtable;
  return [ledMap, ledEffectIDtable] as const;
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
