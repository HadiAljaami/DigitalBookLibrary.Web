import { type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

const AXIS_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const GRID_COLOR = "hsl(var(--border))";

// A calm categorical palette derived from the primary hue.
export const CHART_COLORS = [
  "hsl(173 80% 36%)",
  "hsl(210 80% 55%)",
  "hsl(38 92% 55%)",
  "hsl(280 60% 60%)",
  "hsl(0 72% 60%)",
  "hsl(142 60% 45%)",
];

function ChartFrame({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children as any}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
};

type SeriesKey = { key: string; label: string; color?: string };

export function AreaChartCard({
  title,
  description,
  data,
  xKey,
  series,
  action,
}: {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesKey[];
  action?: ReactNode;
}) {
  const { isRtl } = useLanguage();
  return (
    <ChartFrame title={title} description={description} action={action}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} axisLine={false} reversed={isRtl} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} orientation={isRtl ? "right" : "left"} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? CHART_COLORS[i]}
            fill={`url(#grad-${s.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

export function BarChartCard({
  title,
  description,
  data,
  xKey,
  series,
  action,
}: {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesKey[];
  action?: ReactNode;
}) {
  const { isRtl } = useLanguage();
  return (
    <ChartFrame title={title} description={description} action={action}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} tickLine={false} axisLine={false} reversed={isRtl} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} orientation={isRtl ? "right" : "left"} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color ?? CHART_COLORS[i]}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export function DonutChartCard({
  title,
  description,
  data,
  nameKey,
  valueKey,
  action,
}: {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  action?: ReactNode;
}) {
  return (
    <ChartFrame title={title} description={description} action={action}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          strokeWidth={2}
          stroke="hsl(var(--card))"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
        />
      </PieChart>
    </ChartFrame>
  );
}
