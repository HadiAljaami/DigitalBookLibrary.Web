import { type LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Percent change vs. the previous period; positive is green, negative red. */
  trend?: number;
  /** Small caption under the value, e.g. "vs last month". */
  hint?: string;
  loading?: boolean;
  /** Tailwind text colour class for the icon accent, e.g. "text-primary". */
  accent?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  loading,
  accent = "text-primary",
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-2 h-8 w-20" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  const hasTrend = typeof trend === "number";
  const positive = (trend ?? 0) >= 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn("rounded-xl bg-muted p-3", accent)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {(hasTrend || hint) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {hasTrend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend!)}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
