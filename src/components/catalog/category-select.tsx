import { Folder } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flattenCategories } from "@/lib/categories";
import { type Category } from "@/types/catalog";

type Props = {
  tree: Category[];
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** A leading option (e.g. "All categories" or "None") rendered above the tree. */
  leadingOption?: { value: string; label: string };
};

/**
 * A category picker that renders the tree hierarchy: parent categories carry a folder icon and
 * bolder text; sub-categories are indented and shown in a lighter tone with a connector.
 */
export function CategorySelect({
  tree,
  value,
  onValueChange,
  placeholder,
  className,
  leadingOption,
}: Props) {
  const flat = flattenCategories(tree);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {leadingOption && <SelectItem value={leadingOption.value}>{leadingOption.label}</SelectItem>}
        {flat.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            <span
              className="flex items-center gap-1.5"
              style={{ paddingInlineStart: `${c.depth * 14}px` }}
            >
              {c.depth === 0 ? (
                <Folder className="h-3.5 w-3.5 text-primary" />
              ) : (
                <span className="text-muted-foreground">└</span>
              )}
              <span className={c.hasChildren ? "font-medium" : c.depth > 0 ? "text-muted-foreground" : ""}>
                {c.name}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
