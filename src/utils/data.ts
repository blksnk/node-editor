export const findById = <T extends { id: number | string }>(array: T[], query: number | string): T | undefined =>
  array.find(({ id }) => id === query);
