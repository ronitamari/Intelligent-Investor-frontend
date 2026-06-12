'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProjectionPoint } from '../lib/types';

interface ProjectionChartProps {
  data: ProjectionPoint[];
}

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function ProjectionChart({ data }: ProjectionChartProps) {
  return (
    <div className="chart-wrap" data-testid="projection-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#176b4d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#176b4d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e4e5dd" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(year) => `Y${year}`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => compactCurrency.format(value)}
            tickLine={false}
            axisLine={false}
            width={68}
          />
          <Tooltip
            formatter={(value) => [
              compactCurrency.format(Number(value)),
              'Projected value',
            ]}
            labelFormatter={(year) => `Year ${year}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#176b4d"
            strokeWidth={3}
            fill="url(#projectionFill)"
            activeDot={{ r: 5, fill: '#176b4d' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
