const storage = window.localStorage;

export default storage;

export function setItem(key: string, value: string) {
  storage.setItem(key, value);
}

export function getItem(key: string) {
  return storage.getItem(key);
}

export async function asyncSetItem(key: string, value: any) {
  return new Promise<void>((resolve, reject) => {
    resolve(storage.setItem(key, value));
  });
}

export async function asyncGetItem(key: string) {
  return new Promise<string | null>((resolve, reject) => {
    resolve(storage.getItem(key));
  });
}
