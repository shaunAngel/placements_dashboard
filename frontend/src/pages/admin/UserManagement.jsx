import React, { useState } from 'react';
import { useUserStore, useSettingStore } from '../../store';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { Plus, UserCheck, UserX, Trash2, Edit } from 'lucide-react';

const ROLES = ['Admin', 'Faculty', 'Student'];

export default function UserManagement() {
  const {
    users, addUser, fetchUsers, updateUser, deleteUser,
    selectedUser, setSelectedUser, isModalOpen, closeModal
  } = useUserStore();
  const { branches } = useSettingStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', role: 'Student', branch: '', status: 'Active', rollNo: ''
  });

  React.useEffect(() => {
    fetchUsers();
  }, []);

  React.useEffect(() => {
    if (selectedUser) {
      setForm({ ...selectedUser });
    } else {
      setForm({ name: '', email: '', role: 'Student', branch: '', status: 'Active', rollNo: '' });
    }
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedUser) {
      // EDIT MODE: Use the email from the selected user as the key
      const result = await updateUser(selectedUser.email, form);
      if (!result.success) alert(result.error);
    } else {
      // ADD MODE
      const result = await addUser(form);
      if (result.success) {
        setShowAdd(false); // If using your old local state
      } else {
        alert(result.error);
      }
    }
    closeModal(); // Clears selectedUser and closes modal
  };

  const onEdit = (user) => {
    setSelectedUser(user);
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v, row) => (
        <div>
          <div className="font-semibold text-primary">{v}</div>
          {row.rollNo && <div className="text-[10px] text-gray-400">{row.rollNo}</div>}
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (v) => (
        <span className={`badge ${v === 'Admin' ? 'badge-error' : v === 'Faculty' ? 'badge-primary' : 'badge-gray'}`}>
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
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
                deleteUser(row.email);
              }
            }}
            className="text-error hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage students, faculty, and admin accounts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
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
      <Modal
        isOpen={isModalOpen || showAdd}
        onClose={() => { setShowAdd(false); closeModal(); }}
        title={selectedUser ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {form.role === 'Student' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Roll Number *</label>
              <input
                required
                value={form.rollNo}
                onChange={e => setForm(f => ({ ...f, rollNo: e.target.value.toUpperCase() }))}
                className="input-field"
                placeholder="22071A3243"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role *</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="select-field"
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch (if applicable)</label>
            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="select-field">
              <option value="">None</option>
              {branches.filter(b => b && String(b).trim() !== '').map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setShowAdd(false); closeModal(); }} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">
              {selectedUser ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
