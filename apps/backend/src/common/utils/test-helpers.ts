import type { Mock } from "vitest";
import { vi } from "vitest";

interface MockSort {
  sort: Mock;
}

export function mockFind<T>(data: T[]): MockSort {
  return {
    sort: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(data),
    }),
  };
}

export function mockCreate<T extends Record<string, unknown>>(
  doc: T,
): T & { toObject: Mock } {
  return {
    ...doc,
    toObject: vi.fn().mockReturnValue(doc),
  };
}
