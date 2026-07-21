import { type Category } from "@/types/catalog";

export type FlatCategory = { id: number; label: string };

/**
 * Flattens the category tree into a selectable list, prefixing nested names with their depth so
 * the hierarchy stays readable in a plain dropdown (e.g. "— C# and .NET").
 */
export function flattenCategories(tree: Category[], depth = 0): FlatCategory[] {
  return tree.flatMap((node) => [
    { id: node.id, label: `${"— ".repeat(depth)}${node.name}` },
    ...flattenCategories(node.children ?? [], depth + 1),
  ]);
}
