import React, { useMemo, useState } from 'react';
import { useStudentStore } from '../../store';
import DataTable from '../../components/ui/DataTable';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

export default function Leaderboard() {
  const { students } = useStudentStore();
  const [branch, setBranch] = useState('All');
  const [batch, setBatch] = useState('All');

const ranked = useMemo(() => {
    // 1. Filter out students without a package
    let list = students.filter(s => s.package !== null && s.package !== undefined);

    // 2. Apply your filters
    if (branch !== 'All') list = list.filter(s => s.branch === branch);
    if (batch !== 'All') list = list.filter(s => s.batch === batch);

    // 3. CRITICAL: Numerical Sort
    return [...list].sort((a, b) => {
      const pkgA = parseFloat(a.package) || 0;
      const pkgB = parseFloat(b.package) || 0;
      return pkgB - pkgA; // Highest package (65.0) will now be index 0
    }).slice(0, 100);
  }, [students, branch, batch]);

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      width: '60px',
      sortable: false,
      render: (_, row, rowIndex = ranked.indexOf(row) + 1) => {
        const idx = ranked.indexOf(row) + 1;
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        return (
          <div className={`font-bold text-lg ${idx <= 3 ? 'text-accent' : 'text-gray-400'}`}>
            {idx <= 3 ? <span title={`Rank ${idx}`}>{idx}</span> : idx}
          </div>
        );
      }
    },
    {
      key: 'name',
      label: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: generateAvatarColor(row.name) }}
          >
            {getInitials(row.name)}
          </div>
          <div>
            <div className="font-semibold text-primary text-sm">{row.name}</div>
            <div className="text-xs text-gray-400">{row.rollNo}</div>
          </div>
        </div>
      ),
    },
    { key: 'branch', label: 'Branch' },
  { key: 'batch', label: 'Batch' },
  { 
    key: 'Company', // Changed from 'company' to match your DB image
    label: 'Company' 
  },
  {
    key: 'package',
    label: 'Package (LPA)',
    accessor: r => r.package,
    render: (v, row) => {
        const idx = ranked.indexOf(row) + 1;
        return (
          <span className={`font-bold text-lg ${idx <= 3 ? 'text-accent' : 'text-primary'}`}>
            {v?.toFixed(2)} LPA
          </span>
        );
      },
  },
  { 
    key: 'role', // Your DB uses 'role' for the offer type
    label: 'Offer Type', 
    render: v => v ? <span className="badge badge-primary">{v}</span> : '—' 
  },
  ];

  const uniqueBranches = [...new Set(students.map(s => s.branch))];
  const uniqueBatches = [...new Set(students.map(s => s.batch))];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Placement Leaderboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Top students ranked by highest package</p>
        </div>
      </div>

      {/* Podium — Top 3 */}
      <div className="card">
        <h2 className="section-title mb-4">Top 3 Achievers</h2>
        <div className="flex items-end justify-center gap-6">
  {/* The array defines the visual order: Left (Rank 1), Center (Rank 0), Right (Rank 2) */}
  {[1, 0, 2].map((rankIndex, visualIndex) => {
    const student = ranked[rankIndex];
    if (!student) return null;

    // We map the visual position (0, 1, 2) to specific styles
    // visualIndex 0 = Left (Silver), 1 = Center (Gold), 2 = Right (Bronze)
    const podiumStyles = [
      { label: '2nd', height: 'h-24', color: '#9CA3AF' }, // Left
      { label: '1st', height: 'h-32', color: '#F5A623' }, // Center
      { label: '3rd', height: 'h-20', color: '#CD7F32' }, // Right
    ];

    const style = podiumStyles[visualIndex];

    return (
      <div key={rankIndex} className="flex flex-col items-center gap-2">
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white"
          style={{ backgroundColor: generateAvatarColor(student.name) }}
        >
          {getInitials(student.name)}
        </div>

          {/* Info */}
          <div className="text-center">
            <div className="font-bold text-primary text-sm line-clamp-1 w-24">{student.name}</div>
            <div className="text-xs text-gray-400">{student.branch}</div>
            <div className="font-bold text-accent">{student.package?.toFixed(1)} LPA</div>
          </div>

          {/* The Bar */}
          <div
            className={`w-24 rounded-t-lg flex items-center justify-center font-bold text-white text-sm ${style.height}`}
            style={{ backgroundColor: style.color }}
          >
            {style.label}
          </div>
        </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="select-field w-auto" value={branch} onChange={e => setBranch(e.target.value)}>
          <option value="All">All Branches</option>
          {uniqueBranches.map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="select-field w-auto" value={batch} onChange={e => setBatch(e.target.value)}>
          <option value="All">All Batches</option>
          {uniqueBatches.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      <DataTable
        data={ranked}
        columns={columns}
        filename="leaderboard"
      />
    </div>
  );
}
