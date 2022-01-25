interface Fiber {
  color: string;
  alpha: number; //brightness
}

type El = number;

interface LED {
  src: string;
  alpha: number;
}

interface editCurrentStatusAction {
  type: string;
  payload: {
    dancerName: string;
    partName: string;
    value: El;
  };
}
type Action = editCurrentStatusAction;
export default Action;
