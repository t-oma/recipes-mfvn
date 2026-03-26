export type CleanDoc<T> = Omit<T, "_id" | "__v"> & { id: string };

function transformValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(transformValue);
  }
  if (value && typeof value === "object" && "_id" in value) {
    return cleanupDoc(value as Record<string, unknown>);
  }
  return value;
}

/**
 * Transforms MongoDB document to a clean object without MongoDB-specific fields.
 *
 * This function recursively transforms nested objects and arrays removing the MongoDB-specific
 * fields `_id` and `__v`.
 *
 * @param doc - MongoDB document
 * @returns Clean object
 */
export function cleanupDoc<T extends Record<string, unknown>>(
  doc: T,
): CleanDoc<T> {
  const { _id, __v, ...rest } = doc;
  const transformed: Record<string, unknown> = { id: String(_id) };
  for (const [key, value] of Object.entries(rest)) {
    transformed[key] = transformValue(value);
  }
  return transformed as CleanDoc<T>;
}

/**
 * Transforms an array of MongoDB documents to an array of clean objects without MongoDB-specific
 * fields.
 *
 * This function recursively transforms nested objects and arrays removing the MongoDB-specific
 * fields `_id` and `__v`.
 *
 * @param docs - Array of MongoDB documents
 * @returns Array of clean objects
 */
export function cleanupDocs<T extends Record<string, unknown>>(
  docs: T[],
): CleanDoc<T>[] {
  return docs.map(cleanupDoc);
}
