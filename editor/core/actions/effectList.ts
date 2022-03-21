import { registerActions } from "../registerActions";
// types
import { State } from "../models";
import { effectListAgent } from "api";

const actions = registerActions({
    /**
     * add effect to record map and status map, the effect doesn't contain frame of endIndex
     * @param {State} state
     * @param {effectName: string; startTime: number; endTime: number} payload
     */
    addEffect: async (state: State, payload: { effectName: string; startTime: number; endTime: number }) => {
        const { effectName, startTime, endTime } = payload;
        await effectListAgent.addEffectList(effectName, startTime, endTime);
    },

    /**
     * delete chosen effect from EffectRecodeMap and EffectStatusMap
     * @param {State} state
     * @param {string} payload
     */
    deleteEffect: async (state: State, payload: string) => {
        await effectListAgent.deleteEffectList(payload);
    },

    /**
     * apply effect to current frame
     * @param {State} state
     * @param {string} payload
     */
    applyEffect: async (state: State, payload: { clear: boolean; start: number; applyId: string }) => {
        const { clear, start, applyId } = payload;
        await effectListAgent.applyEffectList(clear, start, applyId);
    },
});

export const { addEffect, deleteEffect, applyEffect } = actions;
