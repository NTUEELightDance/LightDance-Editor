interface Window {
  webkitAudioContext: typeof AudioContext;
}

// allow import .json files
declare module "*.json" {
  const value: any;
  export default value;
}
