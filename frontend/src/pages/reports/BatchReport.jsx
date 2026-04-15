import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { yearlyStats } from '../../data/mockData';
import DataTable from '../../components/ui/DataTable';

export default function BatchReport() {
  const batchData = [
    { batch: '2020-24', total: 480, placed: 312, avgPackage: 6.8, highest: 28 },
    { batch: '2021-25', total: 492, placed: 358, avgPackage: 7.4, highest: 32 },
    { batch: '2022-26', total: 510, placed: 180, avgPackage: 8.1, highest: 38 },
    { batch: '2023-27', total: 524, placed: 21, avgPackage: 9.2, highest: 45 },
    { batch: '2024-28', total: 260, placed: 0, avgPackage: 0, highest: 0 },
  ];

  const trendData = batchData.filter(b => b.placed > 0);

  const columns = [
    { key: 'batch', label: 'Batch' },
    { key: 'total', label: 'Total Students', accessor: r => r.total },
    { key: 'placed', label: 'Placed', accessor: r => r.placed, render: v => <span className="text-success font-semibold">{v}</span> },
    {
      key: 'percent', label: 'Placement %',
      accessor: r => r.total ? ((r.placed / r.total) * 100).toFixed(1) : '0.0',
      render: v => <span className="font-bold text-primary">{v}%</span>,
    },
    {
      key: 'avgPackage', label: 'Avg Package', accessor: r => r.avgPackage,
      render: v => v ? <span className="font-semibold text-primary">{v} LPA</span> : '—',
    },
    {
      key: 'highest', label: 'Highest Package', accessor: r => r.highest,
      render: v => v ? <span className="font-bold text-accent">{v} LPA</span> : '—',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Batch-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">Placement trends across academic batches</p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Placement Trend by Batch</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F6FA" />
            <XAxis dataKey="batch" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis yAxisId="right" orientation="right" unit=" LPA" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line yAxisId="left" type="monotone" dataKey="placed" name="Students Placed" stroke="#1A3A6B" strokeWidth={2.5} dot={{ r: 5 }} />
            <Line yAxisId="right" type="monotone" dataKey="avgPackage" name="Avg Package" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DataTable data={batchData} columns={columns} filename="batch-report" />
    </div>
  );
}
