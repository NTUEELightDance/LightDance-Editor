import state from "../index";
// constants
import { IDLE, EDIT, ADD } from "../../constants";
import { setItem } from "../../utils/localStorage";
import { nanoid } from "nanoid";
// utils
import {
  clamp,
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";
// types
import {
  ControlMapType,
  ControlRecordType,
  PosRecordType,
  PosMapType,
  ControlMapStatus,
  LED,
  DancerCoordinates,
  LightPresetsType,
  PosPresetsType,
  EffectRecordMapType,
  EffectStatusMapType,
  EffectRecordType,
} from "../models";
import { produce } from "immer";

const actions = {
  /**
   * Play or Pause
   * @param {boolean} payload
   */
  playPause: (payload: boolean) => {
    state.isPlaying(payload);
  },
  /**
   * Initiate controlRecord and currentStatus (call by simulator/controller.js)
   * @param {array} payload - controlRecord
   */
  controlInit: (payload: {
    controlRecord: ControlRecordType;
    controlMap: ControlMapType;
  }) => {
    const { controlRecord, controlMap } = payload;
    if (controlRecord.length === 0)
      throw new Error(`[Error] controlInit, controlRecord is empty `);
    state.controlRecord(controlRecord);
    state.controlMap(controlMap);
    state.currentStatus(controlMap[controlRecord[0]].status);
  },

  /**
   * Initiate posRecord and currentPos (call by simulator/controller.js)
   * @param {object} payload - posRecord
   */
  posInit: (payload: { posRecord: PosRecordType; posMap: PosMapType }) => {
    const { posRecord, posMap } = payload;
    if (posRecord.length === 0)
      throw new Error(`[Error] posInit, posRecord is empty `);
    state.posRecord(posRecord);
    state.posMap(posMap);
    state.currentPos(posMap[posRecord[0]].pos);
  },
  /**
   * Set selected array
   * @param {*} state
   * @param {array of number} payload - array of dancer's name
   */
  setSelected: (payload: string[]) => {
    state.selected(payload);
  },

  /**
   * toggle one in selected array
   * @param {string} payload - one of dancer's name
   */
  toggleSelected: (payload: string) => {
    const name = payload;
    if (state.selected().includes(name)) {
      // delete the name
      state.selected(state.selected().filter((n) => n !== name));
    } else state.selected([...state.selected(), name]);
  },

  /**
   * Set current Fade
   * @param {*} state
   * @param {*} action
   */
  setCurrentFade: (payload: boolean) => {
    const fade = payload;
    if (typeof fade !== "boolean")
      throw new Error(
        `[Error] setCurrentFade, invalid paramter(fade), ${fade}`
      );
    state.currentFade(fade);
  },

  /**
   * Save currentFade to controlRecord
   * @param {*} state
   */
  saveCurrentFade: () => {
    state.controlMap(
      produce(state.controlMap(), (draft) => {
        draft[state.controlRecord()[state.timeData().controlFrame]].fade =
          state.currentFade();
      })
    );
  },

  /**
   * Set currentStatus
   * @param {*} state
   * @param {*} payload - status
   */
  setCurrentStatus: (payload: ControlMapStatus) => {
    state.currentStatus(payload);
  },

  /**
   * Edit current Status
   * @param {} state
   * @param {*} payload - { dancerName, partName, value} to set EL part
   */
  editCurrentStatus: (payload: {
    dancerName: string;
    partName: string;
    value: number;
  }) => {
    const { dancerName, partName, value } = payload;
    state.currentStatus(
      produce(state.currentStatus(), (draft) => {
        draft[dancerName][partName] = value;
      })
    );
  },

  /**
   * Edit current Status (LED)
   * @param {} state
   */
  editCurrentStatusLED: (payload: {
    dancerName: string;
    partName: string;
    value: { src: string; alpha: number };
  }) => {
    const {
      dancerName,
      partName,
      value: { src, alpha },
    } = payload;
    if (src && src !== "")
      state.currentStatus(
        produce(state.currentStatus(), (draft) => {
          (draft[dancerName][partName] as LED).src = src;
        })
      );
    if (typeof alpha === "number")
      state.currentStatus(
        produce(state.currentStatus(), (draft) => {
          (draft[dancerName][partName] as LED).alpha = alpha;
        })
      );
  },

  /**
   * Save currentStatus, according to controlFrame and mode
   * @param {*} state
   */
  saveCurrentStatus: () => {
    if (state.mode() === EDIT) {
      state.controlMap(
        produce(state.controlMap(), (draft) => {
          draft[state.controlRecord()[state.timeData().controlFrame]].status =
            state.currentStatus();
        })
      );
    } else if (state.mode() === ADD) {
      // generate id
      const newId = nanoid(6);
      state.controlMap(
        produce(state.controlMap(), (draft) => {
          draft[newId] = {
            start: state.timeData().time,
            status: state.currentStatus(),
            fade: state.currentFade(),
          };
        })
      );
      state.controlRecord(
        produce(state.controlRecord(), (draft) => {
          draft.splice(state.timeData().controlFrame + 1, 0, newId);
        })
      );
    }
    state.mode(IDLE);
  },

  saveToLocal: () => {
    setItem("controlRecord", JSON.stringify(state.controlRecord()));
    setItem("controlMap", JSON.stringify(state.controlMap()));
    console.log("Control Saved to Local Storage...");
  },

  /**
   * Delete currentStatus, according to controlFrame
   * @param {*} state
   */
  deleteCurrentStatus: () => {
    if (state.mode() !== IDLE) {
      console.error(`Can't Delete in EDIT or IDLE Mode`);
      return;
    }
    if (state.timeData().controlFrame === 0) {
      console.error(`Can't Delete Frame 0`);
      return;
    }
    state.controlMap(
      produce(state.controlMap(), (draft) => {
        delete draft[state.controlRecord()[state.timeData().controlFrame]];
      })
    );
    state.controlRecord(
      produce(state.controlRecord(), (draft) => {
        draft.splice(state.timeData().controlFrame, 1);
      })
    );
    setItem("controlRecord", JSON.stringify(state.controlRecord()));
  },

  /**
   * Set current pos By Name
   * @param {*} state
   * @param {object} payload - new dancer's pos
   */
  setCurrentPosByName: (payload: {
    name: string;
    x: number;
    y: number;
    z: number;
  }) => {
    const { name, x, y, z } = payload;
    if (!state.currentPos()[name])
      throw new Error(
        `[Error] setCurrentPos, invalid parameter(name), ${name}`
      );
    if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number")
      throw new Error(
        `[Error] setCurrentPos, invalid parameter(x, y, z) ${x}, ${y}, ${z}`
      );
    state.currentPos(
      produce(state.currentPos(), (draft) => {
        draft[name] = { x, y, z };
      })
    );
  },

  /**
   * set current pos
   * @param {*} state
   * @param {*} payload - new pos
   */
  setCurrentPos: (payload: DancerCoordinates) => {
    state.currentPos(payload);
  },

  /**
   * Save currentPos to posRecord
   * @param {*} state
   */
  saveCurrentPos: () => {
    if (state.mode() === EDIT) {
      const frameIndex = state.timeData().posFrame;
      state.posMap(
        produce(state.posMap(), (draft) => {
          draft[state.posRecord()[frameIndex]].pos = state.currentPos();
        })
      );
    } else if (state.mode() === ADD) {
      // generate id
      const newId = nanoid(6);
      state.posMap(
        produce(state.posMap(), (draft) => {
          draft[newId] = {
            start: state.timeData().time,
            pos: state.currentPos(),
          };
        })
      );
      state.posRecord(
        produce(state.posRecord(), (draft) => {
          draft.splice(state.timeData().controlFrame + 1, 0, newId);
        })
      );
    }
    state.mode(IDLE);
    setItem("posRecord", JSON.stringify(state.posRecord()));
    setItem("posMap", JSON.stringify(state.posRecord()));
  },

  /**
   * Delete current pos
   * @param {*} state
   */
  deleteCurrentPos: () => {
    if (state.mode() !== IDLE) {
      console.error(`Can't Delete in EDIT or IDLE Mode`);
      return;
    }
    if (state.timeData().posFrame === 0) {
      console.error(`Can't Delete Frame 0`);
      return;
    }
    state.posRecord(
      produce(state.posRecord(), (draft) => {
        draft.splice(state.timeData().posFrame, 1);
      })
    );
    setItem("posRecord", JSON.stringify(state.posRecord()));
  },

  /**
   * set timeData by time, also set currentStatus and currentPos
   * @param {} state
   * @param {*} payload - number
   */
  setTime: (payload: { from: string; time: number }) => {
    let { from, time } = payload;
    if (from === undefined || time === undefined) {
      throw new Error(
        `[Error] setTime invalid parameter(from ${from}, time ${time})`
      );
    }
    if (isNaN(time)) return;
    time = Math.max(time, 0);

    // set timeData.controlFrame and currentStatus
    const newControlFrame = updateFrameByTimeMap(
      state.controlRecord(),
      state.controlMap(),
      state.timeData().controlFrame,
      time
    );
    state.timeData({
      ...state.timeData(),
      from,
      time,
      controlFrame: newControlFrame,
    });
    // status fade
    if (newControlFrame === state.controlRecord().length - 1) {
      // Can't fade
      state.currentStatus(
        state.controlMap()[state.controlRecord()[newControlFrame]].status
      );
    } else {
      // do fade
      state.currentStatus(
        fadeStatus(
          time,
          state.controlMap()[state.controlRecord()[newControlFrame]],
          state.controlMap()[state.controlRecord()[newControlFrame + 1]]
        )
      );
    }

    // set timeData.posFrame and currentPos
    const newPosFrame = updateFrameByTimeMap(
      state.posRecord(),
      state.posMap(),
      state.timeData().posFrame,
      time
    );
    state.timeData({ ...state.timeData(), posFrame: newPosFrame });
    // position interpolation
    if (newPosFrame === state.posRecord().length - 1) {
      // can't interpolation
      state.currentPos(state.posMap()[state.posRecord()[newPosFrame]].pos);
    } else {
      // do interpolation
      state.currentPos(
        interpolationPos(
          time,
          state.posMap()[state.posRecord()[newPosFrame]],
          state.posMap()[state.posRecord()[newPosFrame + 1]]
        )
      );
    }

    // set currentFade
    state.currentFade(
      state.controlMap()[state.controlRecord()[newControlFrame]].fade
    );
  },

  /**
   * set timeData by controlFrame, also set currentStatus
   * @param {} state
   * @param {*} payload - number
   */
  setControlFrame: (payload: { from: string; controlFrame: number }) => {
    let { from, controlFrame } = payload;
    if (from === undefined || controlFrame === undefined) {
      throw new Error(
        `[Error] setControlFrame invalid parameter(from ${from}, controlFrame ${controlFrame})`
      );
    }
    if (isNaN(controlFrame)) return;
    controlFrame = clamp(controlFrame, 0, state.controlRecord.length - 1);
    state.timeData({
      ...state.timeData(),
      from,
      controlFrame,
      time: state.controlMap()[state.controlRecord()[controlFrame]].start,
    });
    state.currentStatus(
      state.controlMap()[state.controlRecord()[controlFrame]].status
    );
    // set posFrame and currentPos as well (by time)
    const newPosFrame = updateFrameByTimeMap(
      state.posRecord(),
      state.posMap(),
      state.timeData().posFrame,
      state.controlMap()[state.controlRecord()[controlFrame]].start
    );
    state.timeData({
      ...state.timeData(),
      posFrame: newPosFrame,
    });

    state.currentPos(state.posMap()[state.posRecord()[newPosFrame]].pos);
    // set currentFade
    state.currentFade(
      state.controlMap()[state.controlRecord()[controlFrame]].fade
    );
  },

  /**
   * set timeData by posFrame, also set currentPos
   * @param {} state
   * @param {*} payload - number
   */
  setPosFrame: (payload: { from: string; posFrame: number }) => {
    let { from, posFrame } = payload;
    if (from === undefined || posFrame === undefined) {
      throw new Error(
        `[Error] setPosFrame invalid parameter(from ${from}, posFrame ${posFrame})`
      );
    }
    if (isNaN(posFrame)) return;
    posFrame = clamp(posFrame, 0, state.posRecord.length - 1);

    state.timeData({
      ...state.timeData(),
      from,
      posFrame,
      time: state.posMap()[state.posRecord()[posFrame]].start,
    });

    state.currentPos(state.posMap()[state.posRecord()[posFrame]].pos);
    // set controlFrame and currentStatus as well (by time)
    const newControlFrame = updateFrameByTimeMap(
      state.controlRecord(),
      state.controlMap(),
      state.timeData().controlFrame,
      state.posMap()[state.posRecord()[posFrame]].start
    );
    state.timeData({
      ...state.timeData(),
      controlFrame: newControlFrame,
    });
    state.currentStatus(
      state.controlMap()[state.controlRecord()[newControlFrame]].status
    );
    // set currentFade
    state.currentFade(
      state.controlMap()[state.controlRecord()[newControlFrame]].fade
    );
  },

  /**
   * set editor mode, 0: IDLE, 1: EDIT, 2: ADD
   * @param {*} state
   * @param {number} payload - new mode
   */
  setMode: (payload: number) => {
    state.mode(payload);
  },

  /**
   * toggle editor mode, 0: IDLE, 1: EDIT, 2: ADD
   * @param {*} state
   * @param {number} payload - new mode
   */
  toggleMode: (payload: number) => {
    if (payload === state.mode()) {
      state.mode(IDLE);
      //reset currentStatus when switching mode back to IDLE
      const currentControlFrame = state.timeData().controlFrame;
      if (currentControlFrame === state.controlRecord().length - 1) {
        // Can't fade
        state.currentStatus(
          state.controlMap()[state.controlRecord()[currentControlFrame]].status
        );
      } else {
        // do fade
        state.currentStatus(
          fadeStatus(
            state.timeData().time,
            state.controlMap()[state.controlRecord()[currentControlFrame]],
            state.controlMap()[state.controlRecord()[currentControlFrame + 1]]
          )
        );
      }
      //reset currentPosFrame when switching mode back to IDLE
      const currentPosFrame = state.timeData().posFrame;
      if (currentPosFrame === state.posRecord().length - 1) {
        // can't interpolation
        state.currentPos(
          state.posMap()[state.posRecord()[currentPosFrame]].pos
        );
      } else {
        // do interpolation
        state.currentPos(
          interpolationPos(
            state.timeData().time,
            state.posMap()[state.posRecord()[currentPosFrame]],
            state.posMap()[state.posRecord()[currentPosFrame + 1]]
          )
        );
      }
    } else state.mode(payload);
  },

  /**
   * set lightPresets
   * @param {*} state
   * @param {*} action
   */
  setLightPresets: (payload: LightPresetsType) => {
    state.lightPresets(payload);
    setItem("lightPresets", JSON.stringify(state.lightPresets));
  },

  /**
   * edit a lightPreset's name
   * @param {*} state
   * @param {*} payload - index and newName
   */
  editLightPresetsName: (payload: { name: string; idx: number }) => {
    const { name, idx } = payload;
    state.lightPresets(
      produce(state.lightPresets(), (draft) => {
        draft[idx].name = name;
      })
    );
    setItem("lightPresets", JSON.stringify(state.lightPresets()));
  },

  /**
   * add lightPresets
   * @param {*} state
   * @param {*} payload
   */
  addLightPresets: (payload: string) => {
    const name = payload;
    state.lightPresets(
      produce(state.lightPresets(), (draft) => {
        draft.push({ name, status: state.currentStatus() });
      })
    );
    setItem("lightPresets", JSON.stringify(state.lightPresets()));
  },

  /**
   * delete a lightPreset (by index)
   * @param {*} state
   * @param {*} action
   */
  deleteLightPresets: (payload: number) => {
    const idx = payload;
    state.lightPresets(
      produce(state.lightPresets(), (draft) => {
        draft.splice(idx, 1);
      })
    );
    setItem("lightPresets", JSON.stringify(state.lightPresets()));
  },

  /**
   * set lightPresets
   * @param {*} state
   * @param {*} action
   */
  setPosPresets: (payload: PosPresetsType) => {
    state.posPresets(payload);
    setItem("posPresets", JSON.stringify(state.posPresets()));
  },

  /**
   * set effectRecordMap
   * @param {*} state
   * @param {*} action
   */
  setEffectRecordMap: (payload: EffectRecordMapType) => {
    state.effectRecordMap(payload);
    setItem("effectRecordMap", JSON.stringify(state.effectRecordMap()));
  },

  /**
   * set effectStatusMap
   * @param {*} state
   * @param {*} action
   */
  setEffectStatusMap: (payload: EffectStatusMapType) => {
    state.effectStatusMap(payload);
    setItem("effectStatusMap", JSON.stringify(state.effectStatusMap()));
  },

  /**
   * add effect to record map and status map, the effect doesn't contain frame of endIndex
   * @param {*} state
   * @param {*} action
   */
  addEffect: (payload: {
    effectName: string;
    startIndex: number;
    endIndex: number;
  }) => {
    const { effectName, startIndex, endIndex } = payload;
    state.effectRecordMap(
      produce(state.effectRecordMap(), (draft) => {
        draft[effectName] = state.controlRecord().slice(startIndex, endIndex);
      })
    );
    state.effectRecordMap()[effectName].map((id) => {
      state.effectStatusMap(
        produce(state.effectStatusMap(), (draft) => {
          draft[id] = state.controlMap()[id];
        })
      );
    });
    setItem("effectRecordMap", JSON.stringify(state.effectRecordMap()));
    setItem("effectStatusMap", JSON.stringify(state.effectStatusMap()));
  },

  /**
   * delete chosen effect from EffectRecodeMap and EffectStatusMap
   * @param {*} state
   * @param {*} action
   */
  deleteEffect: (payload: string) => {
    const effectName: string = payload;
    const effectFrameId: EffectRecordType = state.effectRecordMap()[effectName];
    effectFrameId.map((id) => {
      state.effectStatusMap(
        produce(state.effectStatusMap(), (draft) => {
          delete draft[id];
        })
      );
    });
    state.effectRecordMap(
      produce(state.effectRecordMap(), (draft) => {
        delete draft[effectName];
      })
    );
    setItem("effectStatusMap", JSON.stringify(state.effectStatusMap()));
    setItem("effectRecodeMap", JSON.stringify(state.effectRecordMap()));
  },

  /**
   * apply effect to current frame
   * @param {*} state
   * @param {*} action
   */
  applyEffect: (payload: string) => {
    const effectName: string = payload;
    const shiftTime: number =
      state.timeData().time -
      state.effectStatusMap()[state.effectRecordMap()[effectName][0]].start;
    const controlRecordCopy = [...state.controlRecord()];
    const controlMapCopy = { ...state.controlMap() };
    state.effectRecordMap()[effectName].map((id) => {
      const newId: string = nanoid(6);
      controlRecordCopy.push(newId);
      controlMapCopy[newId] = { ...state.effectStatusMap()[id] };
      controlMapCopy[newId].start += shiftTime;
    });
    state.controlRecord(
      controlRecordCopy.sort(
        (a, b) => controlMapCopy[a].start - controlMapCopy[b].start
      )
    );
    state.controlMap(controlMapCopy);
  },

  /**
   * edit a lightPreset's name
   * @param {*} state
   * @param {*} payload - index and newName
   */
  editPosPresetsName: (payload: { name: string; idx: number }) => {
    const { name, idx } = payload;
    state.posPresets(
      produce(state.posPresets(), (draft) => {
        draft[idx].name = name;
      })
    );
    setItem("posPresets", JSON.stringify(state.posPresets()));
  },

  /**
   * add lightPresets
   * @param {*} state
   * @param {*} payload
   */
  addPosPresets: (payload: string) => {
    const name = payload;
    state.posPresets(
      produce(state.posPresets(), (draft) => {
        draft.push({ name, pos: state.currentPos() });
      })
    );
    setItem("posPresets", JSON.stringify(state.posPresets()));
  },

  /**
   * delete a lightPreset (by index)
   * @param {*} state
   * @param {*} action
   */
  deletePosPresets: (payload: number) => {
    const idx = payload;
    state.posPresets(
      produce(state.posPresets(), (draft) => {
        draft.splice(idx, 1);
      })
    );
    setItem("posPresets", JSON.stringify(state.posPresets()));
  },

  /**
   * Shift frame time from startFrame to endFrame += shiftTime
   */
  shiftFrameTime: (payload: {
    type: string;
    startFrame: number;
    endFrame: number;
    shiftTime: number;
  }) => {
    const { type, startFrame, endFrame, shiftTime } = payload;
    console.log(type, startFrame, endFrame, shiftTime);

    if (type === "control") {
      const controlMapCopy = { ...state.controlMap() };
      for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
        controlMapCopy[state.controlRecord()[i]].start += shiftTime;
      }
      const controlRecordCopy = [...state.controlRecord()];
      state.controlRecord(
        controlRecordCopy.sort(
          (a, b) => controlMapCopy[a].start - controlMapCopy[b].start
        )
      );
      state.controlMap(controlMapCopy);
    } else {
      const posMapCopy = { ...state.posMap() };
      for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
        posMapCopy[state.posRecord()[i]].start += shiftTime;
      }
      const posRecordCopy = [...state.posRecord()];
      state.posRecord(
        posRecordCopy.sort((a, b) => posMapCopy[a].start - posMapCopy[b].start)
      );
      state.posMap(posMapCopy);
    }
  },
};

export const {
  playPause,
  posInit,
  controlInit,

  setSelected,
  toggleSelected,

  setCurrentFade,
  saveCurrentFade,

  setCurrentStatus,
  editCurrentStatus,
  editCurrentStatusLED,
  saveCurrentStatus,
  deleteCurrentStatus,

  setCurrentPosByName,
  setCurrentPos,
  saveCurrentPos,
  saveToLocal,
  deleteCurrentPos,

  setTime,
  setPosFrame,
  setControlFrame,

  setMode,
  toggleMode,

  setLightPresets,
  editLightPresetsName,
  addLightPresets,
  deleteLightPresets,

  setPosPresets,
  editPosPresetsName,
  addPosPresets,
  deletePosPresets,
  setEffectRecordMap,
  setEffectStatusMap,

  shiftFrameTime,
} = actions;
