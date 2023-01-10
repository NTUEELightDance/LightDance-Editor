export interface LoadType {
  // refered to /data/load.json""
  Music: string
  LightPresets: string
  PosPresets: string
  DancerMap: AnyAction
}
export interface LoadState {
  init: boolean
  music: string // load music path
  load: LoadType
  lightPresets: LightPresetsType // loaded lightPresets.json, may not be same as localStorage (this is for default)
  posPresets: PosPresetsType // loaded lightPresets.json, may not be same as localStorage (this is for default)
  dancerMap: Any
}
