/* eslint-disable no-console */

export function log(message: unknown, ...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message, ...args);
  }
}

export function debug(message: unknown, ...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(message, ...args);
  }
}
