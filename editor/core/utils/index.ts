import { controlAgent, posAgent } from "../../api";

export async function getPos() {
  return await Promise.all([posAgent.getPosMap(), posAgent.getPosRecord()]);
}

export async function getControl() {
  return await Promise.all([
    controlAgent.getControlMap(),
    controlAgent.getControlRecord(),
  ]);
}

export * from "./math";
export * from "./localStorage";
