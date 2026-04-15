import React, { useState } from 'react';
import { Database, Mail, Archive, RefreshCw, Bell, Shield, Users, GraduationCap } from 'lucide-react';

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Icon size={18} className="text-primary" />
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, sub, defaultChecked = true }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-primary' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [activeBatch, setActiveBatch] = useState('2024-28');

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div>
        <h1 className="page-title">Admin Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">System configuration and management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Management */}
        <SettingSection title="Batch Management" icon={GraduationCap}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Active Batch</label>
              <select
                value={activeBatch}
                onChange={e => setActiveBatch(e.target.value)}
                className="select-field"
              >
                {['2021-25', '2022-26', '2023-27', '2024-28'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Create New Batch</label>
              <div className="flex gap-2">
                <input type="text" className="input-field" placeholder="e.g. 2025-29" />
                <button className="btn-primary flex-shrink-0">Create</button>
              </div>
            </div>
            <button className="btn-outline w-full">Archive Completed Batches</button>
          </div>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notification Settings" icon={Bell}>
          <div>
            <Toggle label="New Offer Alert" sub="Notify students when new offers are posted" />
            <Toggle label="Submission Confirmation" sub="Email student on offer letter submission" />
            <Toggle label="Verification Update" sub="Email student when submission is verified/rejected" />
            <Toggle label="Deadline Reminder" sub="Alert students 3 days before offer deadline" />
            <Toggle label="Admin Alerts" sub="Email placement cell for new submissions" defaultChecked />
          </div>
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management" icon={Database}>
          <div className="space-y-3">
            <button className="btn-outline w-full flex items-center gap-2 justify-center">
              <Archive size={15} /> Export All Data (Excel)
            </button>
            <button className="btn-outline w-full flex items-center gap-2 justify-center">
              <Archive size={15} /> Export All Data (CSV)
            </button>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Restore from Backup</label>
              <label className="btn-outline w-full flex items-center gap-2 justify-center cursor-pointer">
                <RefreshCw size={15} /> Upload Backup File
                <input type="file" className="hidden" accept=".xlsx,.csv" />
              </label>
            </div>
            <button className="w-full py-2.5 px-4 border border-error text-error rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
              Purge Test / Dummy Data
            </button>
          </div>
        </SettingSection>

        {/* Email Templates */}
        <SettingSection title="Email Templates" icon={Mail}>
          <div className="space-y-3">
            {[
              'Offer Alert', 'Submission Confirmation', 'Verification Approved', 'Verification Rejected',
            ].map(template => (
              <div key={template} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-gray-700">{template}</span>
                <button className="btn-ghost text-xs py-1 px-3">Edit Template</button>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security Settings" icon={Shield}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Session Timeout (minutes)</label>
              <input type="number" defaultValue={30} className="input-field" min={5} max={120} />
            </div>
            <Toggle label="Two-Factor Authentication" sub="Require 2FA for Admin and Staff logins" defaultChecked={false} />
            <Toggle label="Rate Limit Login Attempts" sub="Block after 5 failed login attempts" />
            <button className="btn-outline w-full">View Login Activity Log</button>
          </div>
        </SettingSection>

        {/* Student Import */}
        <SettingSection title="Bulk Import Students" icon={Users}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Import student records in bulk using the Excel template. Columns: Roll No, Name, Branch, Batch, Email, Contact.
            </p>
            <button className="btn-ghost w-full text-sm">Download Excel Template</button>
            <label className="btn-primary w-full flex items-center gap-2 justify-center cursor-pointer">
              <Archive size={15} /> Upload Student Excel
              <input type="file" className="hidden" accept=".xlsx,.csv" />
            </label>
          </div>
        </SettingSection>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary px-8">Save All Settings</button>
      </div>
    </div>
  );
}
