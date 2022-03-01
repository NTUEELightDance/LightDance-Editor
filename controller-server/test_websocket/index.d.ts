interface LightStatusType {}
interface PlayTimeType {
    startTime: number;
    delay: number;
    sysTime: number;
}
// type controlJson = ?;
// type LedType = ?;
// Above type are for payload definition
type PayloadType = number | string | LightStatusType | PlayTimeType;
interface RpiSocketMes {
    command: string;
    payload?: PayloadType;
}
