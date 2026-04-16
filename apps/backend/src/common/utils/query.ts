export function getSortDetails<const T extends string>(sort: T): [T, 1 | -1] {
  const desc = sort.startsWith("-");
  const sortName = desc ? (sort.slice(1) as T) : sort;
  const sortOrder = desc ? -1 : 1;

  return [sortName, sortOrder];
}

export function getSortObject<const T extends string>(sort: T) {
  const [name, order] = getSortDetails(sort);

  return { [name]: order };
}
