export const pick = (
  obj: Record<string, unknown>,
  keys: Readonly<string[]>
): Record<string, unknown> => {
  const result = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
};
