import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogService } from "@/services/catalog-service";
import { flattenCategories } from "@/lib/categories";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { type Category, type SaveCategoryDto } from "@/types/catalog";

const NO_PARENT = "none";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The category being edited (edit mode). */
  category?: Category;
  /** Pre-selected parent when adding a sub-category. */
  defaultParentId?: number | null;
  tree: Category[];
};

export function CategoryFormDialog({ open, onOpenChange, category, defaultParentId, tree }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = category != null;

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>(NO_PARENT);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    const parent = category?.parentCategoryId ?? defaultParentId ?? null;
    setParentId(parent != null ? String(parent) : NO_PARENT);
  }, [open, category, defaultParentId]);

  // A category can't be its own parent (nor, by the backend guard, a descendant).
  const options = flattenCategories(tree).filter((c) => c.id !== category?.id);

  const mutation = useMutation({
    mutationFn: () => {
      const dto: SaveCategoryDto = {
        name: name.trim(),
        parentCategoryId: parentId === NO_PARENT ? null : Number(parentId),
      };
      return isEdit
        ? catalogService.updateCategory(category!.id, dto)
        : catalogService.createCategory(dto);
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "categories.editTitle" : "categories.addTitle")}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) mutation.mutate();
          }}
          className="grid gap-4"
        >
          <div className="space-y-1.5">
            <Label>{t("categories.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>

          <div className="space-y-1.5">
            <Label>{t("categories.parent")}</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PARENT}>{t("categories.noParent")}</SelectItem>
                {options.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Re-fetches the category tree; used by the page to drive the dialog. */
export function useCategoryTree() {
  return useQuery({ queryKey: ["categories", "tree"], queryFn: () => catalogService.categoryTree() });
}
