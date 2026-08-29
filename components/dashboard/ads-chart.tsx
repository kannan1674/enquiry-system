'use client';

import { memo, useCallback, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCount, formatMoney } from '@/lib/ads/format';

const TOOLTIP_CURSOR = { fill: 'rgba(99,102,241,0.06)' };

export type AdsChartPoint = {
  name: string;
  queries: number;
  spend: number;
};

export const AdsChart = memo(function AdsChart({
  data,
  currency,
}: {
  data: AdsChartPoint[];
  currency: string;
}) {
  const formatter = useCallback(
    (value: number | string, name: string) =>
      name === 'spend' ? formatMoney(Number(value), currency) : formatCount(Number(value)),
    [currency],
  );

  const ticks = useMemo(() => ({ fontSize: 11, fill: '#64748b' }), []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={ticks} axisLine={false} tickLine={false} />
        <YAxis tick={ticks} axisLine={false} tickLine={false} />
        <Tooltip cursor={TOOLTIP_CURSOR} formatter={formatter} />
        <Bar dataKey="queries" name="queries" fill="#818cf8" radius={[8, 8, 0, 0]} />
        <Bar dataKey="spend" name="spend" fill="#fb923c" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
