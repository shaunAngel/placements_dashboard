import React, { useState, useMemo } from 'react';
import { useStudentStore } from '../../store';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { getStatusColor, getInitials, generateAvatarColor, formatDate } from '../../utils/helpers';

export default function StudentReport() {
  const { students } = useStudentStore();
  const [filters, setFilters] = useState({ branch: 'All', batch: 'All', status: 'All', search: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = useMemo(() => {
    let list = students;

    if (filters.branch !== 'All')
      list = list.filter(s => s.branch?.trim() === filters.branch);

    if (filters.batch !== 'All')
      list = list.filter(s => s.batch === Number(filters.batch));

    if (filters.status !== 'All')
      list = list.filter(s =>
        s.status?.replace(',', '').trim() === filters.status
      );

    return list;
  }, [students, filters]);

  const branches = [
    ...new Set(
      students.map(s => s.branch?.replace(',', '').trim())
    )
  ];
  const batches = [...new Set(students.map(s => s.batch))];

  const columns = [
    { key: 'rollNo', label: 'Roll No', width: '120px' },
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: generateAvatarColor(row.name) }}>
            {getInitials(row.name)}
          </div>
          <span className="font-medium text-primary">{row.name}</span>
        </div>
      ),
    },
    { key: 'branch', label: 'Branch', width: '80px' },
    { key: 'batch', label: 'Batch', width: '100px' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`badge ${getStatusColor(v)}`}>{v}</span>,
    },
    { key: 'Company', label: 'Company', render: v => v || '—' },
    {
      key: 'package',
      label: 'Package',
      accessor: r => r.package,
      render: (v, row) => v ? <span className="font-bold text-accent">{v.toFixed(2)} LPA</span> : '—',
    },
    { key: 'role', label: 'Offer Type', render: v => v ? <span className="badge badge-primary">{v}</span> : '—' },
    {
      key: 'offerDate',
      label: 'Offer Date',
      accessor: r => r.offerDate,
      render: v => formatDate(v),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Student-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">Complete placement records for all students</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <select className="select-field w-auto" value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
            <option value="All">All Branches</option>
            {branches.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="select-field w-auto" value={filters.batch} onChange={e => setFilters(f => ({ ...f, batch: e.target.value }))}>
            <option value="All">All Batches</option>
            {batches.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="select-field w-auto" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="All">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Not Placed">Not Placed</option>
            <option value="PPO">PPO</option>
            <option value="Intern">Intern</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        filename="student-report"
        onRowClick={setSelectedStudent}
        rowClassName={(row) =>
          row.status === 'Placed' ? 'border-l-2 border-l-success' :
            row.status === 'Unplaced' ? '' : 'border-l-2 border-l-accent'
        }
      />

      {/* Student Detail Modal */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Details" size="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: generateAvatarColor(selectedStudent.name) }}>
                {getInitials(selectedStudent.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{selectedStudent.name}</h3>
                <div className="text-gray-500 text-sm">{selectedStudent.rollNo} · {selectedStudent.branch} · {selectedStudent.batch}</div>
                <span className={`badge mt-1 ${getStatusColor(selectedStudent.status)}`}>{selectedStudent.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Email', selectedStudent.email],
                ['Contact', selectedStudent.contact],
                ['CGPA', selectedStudent.cgpa],
                ['Company', selectedStudent.company || '—'],
                ['Package', selectedStudent.package ? `${selectedStudent.package.toFixed(2)} LPA` : '—'],
                ['Offer Type', selectedStudent.offerType || '—'],
                ['Offer Date', formatDate(selectedStudent.offerDate)],
                ['Location', '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{k}</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
