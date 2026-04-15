import React, { useMemo, useState } from 'react';
import { useStudentStore } from '../../store';
import DataTable from '../../components/ui/DataTable';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

export default function Leaderboard() {
  const { students } = useStudentStore();
  const [branch, setBranch] = useState('All');
  const [batch, setBatch] = useState('All');

  const ranked = useMemo(() => {
    let list = students.filter(s => s.package);
    if (branch !== 'All') list = list.filter(s => s.branch === branch);
    if (batch !== 'All') list = list.filter(s => s.batch === batch);
    return [...list].sort((a, b) => b.package - a.package).slice(0, 100);
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
    { key: 'company', label: 'Company' },
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
    { key: 'offerType', label: 'Offer Type', render: v => <span className="badge badge-primary">{v}</span> },
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
          {[1, 0, 2].map((i) => {
            const student = ranked[i];
            if (!student) return null;
            const heights = [24, 32, 20];
            const labels = ['2nd', '1st', '3rd'];
            const colors = ['#9CA3AF', '#F5A623', '#CD7F32'];
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white"
                  style={{ backgroundColor: generateAvatarColor(student.name) }}>
                  {getInitials(student.name)}
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary text-sm">{student.name}</div>
                  <div className="text-xs text-gray-400">{student.branch} · {student.batch}</div>
                  <div className="font-bold text-accent">{student.package?.toFixed(1)} LPA</div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">{student.company}</div>
                </div>
                <div
                  className="w-24 rounded-t-lg flex items-center justify-center font-bold text-white text-sm"
                  style={{ height: `${heights[i] * 4}px`, backgroundColor: colors[i] }}
                >
                  {labels[i]}
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
