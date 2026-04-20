import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DataTable from '../../components/ui/DataTable';
import { useSettingStore } from '../../store';

export default function BranchReport() {
  const [branchData, setBranchData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const { branches } = useSettingStore();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/branches")
      .then(res => setBranchData(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter data based on selected branch
  const filteredData = selectedBranch === 'All'
    ? branchData
    : branchData.filter(d => d.branch === selectedBranch);

  const columns = [
    { key: 'branch', label: 'Branch' },

    {
      key: 'totalStudents',
      label: 'Total Students',
      accessor: r => r.totalStudents
    },

    {
      key: 'placed',
      label: 'Placed',
      accessor: r => r.placed,
      render: v => <span className="text-success font-semibold">{v}</span>
    },

    {
      key: 'unplaced',
      label: 'Unplaced',
      accessor: r => r.totalStudents - r.placed,
      render: v => <span className="text-error font-semibold">{v}</span>
    },

    {
      key: 'percent',
      label: 'Placement %',
      accessor: r => r.placementPercentage,
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${v}%` }} />
          </div>
          <span className="font-bold text-primary text-sm">{v}%</span>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      <div>
        <h1 className="page-title">Branch-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Placement statistics per department
        </p>
      </div>

      {/* Branch Filter */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="select-field w-auto"
          value={selectedBranch}
          onChange={e => setSelectedBranch(e.target.value)}
        >
          <option value="All">All Branches</option>
          {branches.filter(b => b && String(b).trim() !== '').map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Branch Comparison</h2>

        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="placed" name="Placed" fill="#1A3A6B" />
              <Bar dataKey="totalStudents" name="Total" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">No data available for selected branch</div>
        )}
      </div>

      <DataTable data={filteredData} columns={columns} filename="branch-report" />
    </div>
  );
}