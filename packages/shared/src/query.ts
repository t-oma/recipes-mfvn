/**
 * Extracts the sort name and sort order from a sort string.
 *
 * @param sort - The sort string.
 * @returns An array containing the sort name and sort order.
 */
export function getSortDetails<const T extends string>(sort: T): [T, 1 | -1] {
  const desc = sort.startsWith("-");
  const sortName = desc ? (sort.slice(1) as T) : sort;
  const sortOrder = desc ? -1 : 1;

  return [sortName, sortOrder];
}

/**
 * Converts a sort string to a MongoDB compatible sort object.
 *
 * @param sort - The sort string.
 * @returns A MongoDB sort object.
 */
export function getSortObject<const T extends string>(sort: T) {
  const [name, order] = getSortDetails(sort);

  return { [name]: order };
}
