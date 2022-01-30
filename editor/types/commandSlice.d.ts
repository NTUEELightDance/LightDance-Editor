interface DancerStatusElement {
	dancerName?: string;
	ip: string;
	hostname?: string;
	isConnected: boolean;
	msg: string;
	OK?: boolean;
}
export interface BoardConfigType {
	[index: string]: {
		type: string;
		ip: string;
		dancerName: string;
	};
}
export interface DancerStatusType {
	[index: string]: DancerStatusElement;
}
export interface CommandState {
	play: boolean;
	stop: boolean;
	startTime: number;
	sysTime: number;
	dancerStatus: DancerStatusType;
}
