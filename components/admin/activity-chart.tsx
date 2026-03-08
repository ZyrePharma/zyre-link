"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityChartProps {
  data: {
    date: string;
    views: number;
    clicks: number;
  }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-[200px] md:h-[300px] w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ 
              borderRadius: "8px", 
              border: "1px solid hsl(var(--border))", 
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))"
            }}
            itemStyle={{ fontSize: "14px" }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorViews)"
            name="Profile Views"
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClicks)"
            name="Link Clicks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
