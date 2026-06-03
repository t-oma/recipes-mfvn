export function toUTCWithoutTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRecipeDate(createdAt: string, updatedAt: string) {
  if (createdAt === updatedAt) {
    return new Date(createdAt).toLocaleDateString();
  }

  const created = new Date(createdAt);
  const updated = new Date(updatedAt);

  if (created < updated) {
    return `Created ${toUTCWithoutTime(created)}`;
  } else {
    return `Updated ${toUTCWithoutTime(updated)}`;
  }
}
