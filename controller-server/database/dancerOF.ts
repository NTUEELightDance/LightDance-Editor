import { SingleDancerControlType, ControlType } from "../types"

type OfJsonType = SingleDancerControlType

// OfJsonDB can be initialized by control panel's "uploadOf" command 
let OfJsonDB: {[key: string]: OfJsonType[]} = {
}

export { OfJsonDB, OfJsonType }
    