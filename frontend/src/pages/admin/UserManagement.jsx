import React, { useState } from 'react';
import { useUserStore } from '../../store';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { Plus, UserCheck, UserX } from 'lucide-react';

const ROLES = ['Admin', 'Staff', 'Faculty', 'Student'];

export default function UserManagement() {
  const { users, addUser, deactivateUser, updateUser } = useUserStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Student', branch: '', status: 'Active' });

  const handleAddUser = (e) => {
    e.preventDefault();
    addUser({ id: `u${Date.now()}`, ...form });
    setShowAdd(false);
    setForm({ name: '', email: '', role: 'Student', branch: '', status: 'Active' });
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v) => <span className="font-semibold text-primary">{v}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (v) => (
        <span className={`badge ${v === 'Admin' ? 'badge-error' : v === 'Staff' ? 'badge-accent' : v === 'Faculty' ? 'badge-primary' : 'badge-gray'}`}>
          {v}
        </span>
      ),
    },
    { key: 'branch', label: 'Branch', render: v => v || '—' },
    {
      key: 'status', label: 'Status',
      render: (v) => <span className={`badge ${v === 'Active' ? 'badge-success' : 'badge-error'}`}>{v}</span>,
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); deactivateUser(row.id); }}
            className="text-error hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            title="Deactivate"
          >
            <UserX size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); updateUser(row.id, { status: 'Active' }); }}
            className="text-success hover:bg-green-50 p-1.5 rounded-lg transition-colors"
            title="Activate"
          >
            <UserCheck size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage students, faculty, staff and admin accounts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="card text-center py-4">
              <div className="text-2xl font-bold text-accent">{count}</div>
              <div className="text-sm text-gray-500 mt-1">{role}s</div>
            </div>
          );
        })}
      </div>

      <DataTable data={users} columns={columns} filename="users" />

      {/* Add User Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field"
              placeholder="email@vnrvjiet.ac.in"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role *</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="select-field">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch (if applicable)</label>
            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="select-field">
              <option value="">None</option>
              {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CHEM'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Add User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
