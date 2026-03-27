import { formatCurrency, formatMonth } from "../lib/format";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MonthlySalesPoint } from "../types/api";

interface BarChartProps {
  data: MonthlySalesPoint[];
}

export function BarChart({ data }: BarChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    revenue: Number(point.revenue),
    monthLabel: formatMonth(point.month)
  }));

  return (
    <div className="rounded-[1.5rem] bg-white/55 p-5">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 12, right: 16, left: 16, bottom: 12 }}>
            <defs>
              <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4dd4c0" />
                <stop offset="55%" stopColor="var(--brand)" />
                <stop offset="100%" stopColor="var(--brand-strong)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(120, 113, 108, 0.25)" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#57534e", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={95}
              tick={{ fill: "#57534e", fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 118, 110, 0.12)" }}
              contentStyle={{
                borderRadius: "1rem",
                border: "1px solid rgba(75, 57, 39, 0.12)",
                background: "rgba(255, 250, 244, 0.98)",
                boxShadow: "0 10px 26px rgba(28, 25, 23, 0.12)"
              }}
              formatter={(value, _name, item) => {
                const payload = item.payload as MonthlySalesPoint;
                return [formatCurrency(Number(value)), `${payload.transactionCount} deals`];
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar
              dataKey="revenue"
              fill="url(#salesRevenueGradient)"
              radius={[12, 12, 4, 4]}
              maxBarSize={46}
              animationDuration={700}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
