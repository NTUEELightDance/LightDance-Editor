interface Fiber {
  color: string;
  alpha: number; //brightness
}

type El = number;

export interface LED {
  src: string;
  alpha: number;
}

interface editCurrentStatusAction {
  type: string;
  payload: {
    dancerName: string;
    partName: string;
    value: El | LED | Fiber;
  };
}
type Action = editCurrentStatusAction;
export default Action;
