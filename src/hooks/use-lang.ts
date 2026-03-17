import { useSyncExternalStore } from "react";

export type Lang = "TypeScript" | "JavaScript";

let current: Lang = "TypeScript";
const listeners = new Set<() => void>();

export function setLang(value: Lang) {
  current = value;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, () => current, () => current);
}