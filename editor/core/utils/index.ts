import { controlAgent, posAgent, ledAgent } from "@/api";
import { reactiveState, state } from "@/core/state";
import { notification } from "./Notification";

/**
 * Get [posMap, posRecord] from posAgent
 */
export async function getPosPayload() {
  return await Promise.all([
    posAgent.getPosMapPayload(),
    posAgent.getPosRecord(),
  ]);
}

export async function getControl() {
  const controlRecord = await controlAgent
    .getControlRecord()
    .then((controlRecord) => {
      return controlRecord;
    });

  // wait for the cache to update
  const waitForControlMap = async (retry = 0): Promise<void> => {
    if (
      retry > 0 &&
      controlRecord.length !== Object.keys(state.controlMap).length
    ) {
      // wait for some time
      await new Promise((resolve) => setTimeout(resolve, 50));
      return await waitForControlMap(retry - 1);
    } else if (
      retry === 0 &&
      controlRecord.length !== Object.keys(state.controlMap).length
    ) {
      notification.error("failed to get control map");
    }
    return;
  };

  if (Object.keys(state.controlMap).length === 0) {
    await controlAgent.getControlMapPayload();
  }

  if (controlRecord.length !== Object.keys(state.controlMap).length) {
    await waitForControlMap(100);
  }

  const controlMap = state.controlMap;

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
export * from "./timeFormat";
export * from "./log";
