export interface LightStatusType { }
export interface PlayTimeType {
    startTime: number;
    delay: number;
    sysTime: number;
}
// type controlJson = ?;
// type LedType = ?;
// Above type are for payload definition
export type PayloadType = number | string | LightStatusType | PlayTimeType;
export interface SocketMes {
    command: string;
    payload?: PayloadType;
}

export { LightStatusType, PlayTimeType, PayloadType, RpiSocketMes }