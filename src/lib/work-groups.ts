export type WorkGroup<T> = {
  id: "professional" | "community";
  title: string;
  items: T[];
};

export function visibleWorkGroups<T>(
  experiences: T[],
  community: T[],
  labels: { professional: string; community: string },
): WorkGroup<T>[] {
  return [
    { id: "professional", title: labels.professional, items: experiences },
    { id: "community", title: labels.community, items: community },
  ].filter((group) => group.items.length > 0) as WorkGroup<T>[];
}
