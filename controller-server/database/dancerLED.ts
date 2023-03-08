import { SingleDancerControlType, ControlType } from "../types"

interface LedJsonType {
    [LedKey: string]: SingleDancerControlType[]
}

// LedJsonDB can be initialized by control panel's "uploadLed" command 
let LedJsonDB: {[key: string]: LedJsonType} = {
    
}

export { LedJsonDB, LedJsonType }
    