export const pick = <T extends object, K extends keyof T>(object: T, keys: K[]) =>
  keys.reduce(
    (result, key) => ({ ...result, ...(key in object ? { [key]: object[key] } : {}) }),
    {} as Pick<T, K>,
  );
