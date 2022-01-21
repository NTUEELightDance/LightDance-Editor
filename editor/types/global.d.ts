interface Window {
  webkitAudioContext: typeof AudioContext;
}

//allow import .json files
declare module "*.json" {
  const value: any;
  export default value;
}

declare module 'nanoid' {
    export default function nanoid(size?: number): string;
}
