export type ValueOf<T> = T[keyof T];

export function getProp<T, K extends keyof T>(
  obj: T,
  key: K,
): ValueOf<T> | undefined {
  return obj[key];
}
