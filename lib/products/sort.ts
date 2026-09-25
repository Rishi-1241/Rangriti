export type SortKey = "newest" | "price-asc" | "price-desc" | "name";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A – Z" },
];

type Sortable = { title: string; price: number | null; created_at: string };

/** Pure sort; items without a price always go last. */
export function sortProducts<T extends Sortable>(list: T[], key: SortKey): T[] {
  const out = [...list];
  const byPrice = (dir: 1 | -1) => (a: T, b: T) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return (a.price - b.price) * dir;
  };
  switch (key) {
    case "price-asc":
      return out.sort(byPrice(1));
    case "price-desc":
      return out.sort(byPrice(-1));
    case "name":
      return out.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}
