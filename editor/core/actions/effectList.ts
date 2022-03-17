import { registerActions } from "../registerActions";
// types
import { State } from "../models";
import { effectListAgent } from "api";

const actions = registerActions({
    getEffectList: async (state: State) => {
        const data = await effectListAgent.getEffectList();
        console.log(data);
        state.effectList = data;
    },
    /**
     * add effect to record map and status map, the effect doesn't contain frame of endIndex
     * @param {State} state
     * @param {effectName: string; startIndex: number; endIndex: number} payload
     */
    addEffect: async (state: State, payload: { effectName: string; startIndex: number; endIndex: number }) => {
        // todo: mutation API
        const { effectName, startIndex, endIndex } = payload;
        console.log({ effectName, startIndex, endIndex });
        await effectListAgent.addEffectList(effectName, startIndex, endIndex);
    },

    /**
     * delete chosen effect from EffectRecodeMap and EffectStatusMap
     * @param {State} state
     * @param {string} payload
     */
    deleteEffect: async (state: State, payload: string) => {
        // todo: mutation API
        await effectListAgent.deleteEffectList(payload);
    },

    /**
     * apply effect to current frame
     * @param {State} state
     * @param {string} payload
     */
    applyEffect: async (state: State, payload: { clear: boolean; start: number; applyId: string }) => {
        // todo: mutation API
        const { clear, start, applyId } = payload;
        await effectListAgent.applyEffectList(clear, start, applyId);
    },
});

export const { getEffectList, setEffectRecordMap, setEffectStatusMap, addEffect, deleteEffect, applyEffect } = actions;
