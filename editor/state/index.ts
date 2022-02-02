import { ReactiveVar, makeVar } from "@apollo/client";

// types
import {
  ControlMapType,
  ControlRecordType,
  PosRecordType,
  PosMapType,
  ControlMapStatus,
  DancerCoordinates,
  LightPresetsType,
  PosPresetsType,
  EffectRecordMapType,
  EffectStatusMapType,
  TimeDataType,
} from "./models";

interface State {
  isPlaying: ReactiveVar<boolean>; // isPlaying
  selected: ReactiveVar<string[]>; // array of selected dancer's name
  currentFade: ReactiveVar<boolean>; // current control Frame will fade to next
  currentStatus: ReactiveVar<ControlMapStatus>; // current dancers' status
  currentPos: ReactiveVar<DancerCoordinates>; // currnet dancers' position
  controlRecord: ReactiveVar<ControlRecordType>; // array of all IDs , each correspondsto diff status
  controlMap: ReactiveVar<ControlMapType>;
  posRecord: ReactiveVar<PosRecordType>; // array of all dancer's pos
  posMap: ReactiveVar<PosMapType>;
  timeData: ReactiveVar<TimeDataType>;
  mode: ReactiveVar<number>; // 0: nothing, 1: edit, 2: add
  effectRecordMap: ReactiveVar<EffectRecordMapType>; // map of all effects and corresponding record ID array
  effectStatusMap: ReactiveVar<EffectStatusMapType>; // map of effect record ID and its status
  lightPresets: ReactiveVar<LightPresetsType>;
  posPresets: ReactiveVar<PosPresetsType>;
}

// states
const state: State = {
  isPlaying: makeVar<boolean>(false),
  selected: makeVar<string[]>([]),

  currentFade: makeVar<boolean>(false),
  currentStatus: makeVar<ControlMapStatus>({}),
  currentPos: makeVar<DancerCoordinates>({}),

  controlRecord: makeVar<ControlRecordType>([]),
  controlMap: makeVar<ControlMapType>({}),
  posRecord: makeVar<PosRecordType>([]),
  posMap: makeVar<PosMapType>({}),
  timeData: makeVar<TimeDataType>({
    from: "",
    time: 0,
    controlFrame: 0,
    posFrame: 0,
  }),

  mode: makeVar<number>(0),
  effectRecordMap: makeVar<EffectRecordMapType>({}),
  effectStatusMap: makeVar<EffectStatusMapType>({}),
  lightPresets: makeVar<LightPresetsType>([]),
  posPresets: makeVar<PosPresetsType>([]),
};

export default state;
