export function toUTCWithoutTime(date: Date) {
  return date.toUTCString().split(" ").slice(0, -2).join(" ");
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
