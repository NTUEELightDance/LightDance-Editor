const storage = window.localStorage;

export default storage;

export function setItem(key, value) {
  storage.setItem(key, value);
}

export function getItem(key) {
  return storage.getItem(key);
}
