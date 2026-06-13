import { z } from "zod";

export const sortOrderSchema = z.enum(["asc", "desc"]);

export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * Converts a sort field and order to a MongoDB compatible sort object.
 *
 * @param options - The sort field and order.
 * @returns A MongoDB sort object.
 *
 * @example
 * getSortObject({ sort: "name", order: "asc" }); // { name: 1 }
 * getSortObject({ sort: "name", order: "desc" }); // { name: -1 }
 */
export function getSortObject<const T extends string>({
  sort,
  order,
}: {
  sort: T;
  order: SortOrder;
}): Record<T, 1 | -1> {
  const sortOrder: 1 | -1 = order === "desc" ? -1 : 1;

  return { [sort]: sortOrder } as Record<T, 1 | -1>;
}
