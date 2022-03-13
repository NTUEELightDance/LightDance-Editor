export const formatDisplayedTime = (time: number) => {
  time = Math.floor(time);
  const millis = String(time % 1000)
    .split(".")[0]
    .padStart(3, "0");
  time = Math.floor(time / 1000);
  const secs = String(time % 60)
    .split(".")[0]
    .padStart(2, "0");
  time = Math.floor(time / 60);
  const mins = String(time % 60).split(".")[0];
  return `${mins}:${secs}:${millis}`;
};
