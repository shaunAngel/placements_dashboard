import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { branchStats } from '../../data/mockData';
import DataTable from '../../components/ui/DataTable';

export default function BranchReport() {
  const columns = [
    { key: 'branch', label: 'Branch' },
    { key: 'total', label: 'Total Students', accessor: r => r.total },
    { key: 'placed', label: 'Placed', accessor: r => r.placed, render: v => <span className="text-success font-semibold">{v}</span> },
    {
      key: 'unplaced', label: 'Unplaced',
      accessor: r => r.total - r.placed,
      render: v => <span className="text-error font-semibold">{v}</span>,
    },
    {
      key: 'percent', label: 'Placement %',
      accessor: r => ((r.placed / r.total) * 100).toFixed(1),
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${v}%` }} />
          </div>
          <span className="font-bold text-primary text-sm">{v}%</span>
        </div>
      ),
    },
    {
      key: 'avgPackage', label: 'Avg Package', accessor: r => r.avgPackage,
      render: v => <span className="font-semibold text-primary">{v} LPA</span>,
    },
    {
      key: 'highest', label: 'Highest Package', accessor: r => r.highest,
      render: v => <span className="font-bold text-accent">{v} LPA</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Branch-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">Placement statistics per department</p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Branch Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={branchStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F6FA" />
            <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="placed" name="Placed" fill="#1A3A6B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable data={branchStats} columns={columns} filename="branch-report" />
    </div>
  );
}
