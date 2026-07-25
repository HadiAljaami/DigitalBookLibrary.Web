import { type Category } from "@/types/catalog";

export type FlatCategory = {
  id: number;
  name: string;
  /** Prefixed label kept for plain dropdowns (e.g. "— C# and .NET"). */
  label: string;
  depth: number;
  hasChildren: boolean;
};

/**
 * Flattens the category tree into a selectable list, keeping each node's depth and whether it has
 * children so a picker can render the hierarchy (indentation, distinct parent styling).
 */
export function flattenCategories(tree: Category[], depth = 0): FlatCategory[] {
  return tree.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      label: `${"— ".repeat(depth)}${node.name}`,
      depth,
      hasChildren: (node.children ?? []).length > 0,
    },
    ...flattenCategories(node.children ?? [], depth + 1),
  ]);
}
