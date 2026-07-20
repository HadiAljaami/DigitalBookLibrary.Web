import { Construction } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

/** Temporary page for routes that are not built yet. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <Construction className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This section is part of the reusable template and is ready to be wired to real data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
