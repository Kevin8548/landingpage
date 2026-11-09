/** Returns a shallow copy without the selected keys. */
export function omitKeys<T extends object, K extends keyof T>(value: T, ...keys: K[]): Omit<T, K> {
  const omitted = new Set<PropertyKey>(keys);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.has(key))) as Omit<T, K>;
}
