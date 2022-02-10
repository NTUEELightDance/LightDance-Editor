const storage = window.localStorage;

export default storage;

export function setItem(key: string, value: string) {
  storage.setItem(key, value);
}

export function getItem(key: string) {
  return storage.getItem(key);
}
