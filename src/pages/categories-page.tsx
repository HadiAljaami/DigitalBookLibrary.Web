import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, FolderTree, Plus, Pencil, Trash2, FolderPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CategoryFormDialog,
  useCategoryTree,
} from "@/features/categories/category-form-dialog";
import { toast } from "@/lib/toast-store";
import { catalogService } from "@/services/catalog-service";
import { errorMessage } from "@/lib/error-message";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { type Category } from "@/types/catalog";

type DialogState =
  | { mode: "add-root" }
  | { mode: "add-child"; parentId: number }
  | { mode: "edit"; category: Category }
  | null;

export function CategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const tree = useCategoryTree();
  const [dialog, setDialog] = useState<DialogState>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteCategory(id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const nodes = tree.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("nav.categories")}
        description={t("categories.subtitle")}
        actions={
          <Button onClick={() => setDialog({ mode: "add-root" })}>
            <Plus className="h-4 w-4" />
            {t("categories.addRoot")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-2 sm:p-4">
          {tree.isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : nodes.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("categories.empty")}</p>
          ) : (
            <ul className="space-y-1">
              {nodes.map((node) => (
                <CategoryNode
                  key={node.id}
                  node={node}
                  depth={0}
                  onAddChild={(id) => setDialog({ mode: "add-child", parentId: id })}
                  onEdit={(category) => setDialog({ mode: "edit", category })}
                  onDelete={(category) => {
                    if (confirm(t("categories.confirmDelete", { name: category.name }))) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        tree={nodes}
        category={dialog?.mode === "edit" ? dialog.category : undefined}
        defaultParentId={dialog?.mode === "add-child" ? dialog.parentId : null}
      />
    </div>
  );
}

type NodeProps = {
  node: Category;
  depth: number;
  onAddChild: (parentId: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

function CategoryNode({ node, depth, onAddChild, onEdit, onDelete }: NodeProps) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const Chevron = isRtl ? ChevronLeft : ChevronDown;

  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/60"
        style={{ paddingInlineStart: `${depth * 1.5 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Chevron className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        ) : (
          <span className="w-4" />
        )}

        <FolderTree className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-sm font-medium">{node.name}</span>

        {/* Hover actions */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton title={t("categories.addChild")} onClick={() => onAddChild(node.id)}>
            <FolderPlus className="h-4 w-4" />
          </IconButton>
          <IconButton title={t("common.edit")} onClick={() => onEdit(node)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            title={t("common.delete")}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {hasChildren && expanded && (
        <ul className="space-y-1">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function IconButton({
  title,
  className,
  onClick,
  children,
}: {
  title: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", className)}
      title={title}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
