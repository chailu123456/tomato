import { isPlainObject } from "./index";
export function setSession(key: string, value: string): void {
  if (isPlainObject(value)) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
}

export function getSession(key: string, parse?: boolean): string | null | Record<string, any> {
  let storage = localStorage.getItem(key);
  if (parse) {
    storage = storage && JSON.parse(storage);
  }
  return storage;
}

export function clearSession(key?: string): void {
  key ? localStorage.removeItem(key) : localStorage.clear();
}
