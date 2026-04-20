import React, { useState, useEffect } from "react";
import axios from "axios";
import { exportToExcel, exportToCSV } from "../../utils/helpers";

const API = "http://127.0.0.1:8000/api/settings";

export default function AdminSettings() {
  // ── Notification settings ─────────────────────
  const [settings, setSettings] = useState({
    new_offer_alert: true,
    submission_confirmation: true,
    verification_update: true,
    deadline_reminder: true,
    admin_alerts: true,
  });

  // ── Batch management ──────────────────────────
  const [batches, setBatches] = useState([]);
  const [newBatch, setNewBatch] = useState("");

  // ── Branch management ─────────────────────────
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState("");
  const [editingBranch, setEditingBranch] = useState(null);
  const [editBranchName, setEditBranchName] = useState("");

  // ── Loading states ────────────────────────────
  const [saving, setSaving] = useState(false);

  // ── Fetch on mount ────────────────────────────
  useEffect(() => {
    fetchSettings();
    fetchBatches();
    fetchBranches();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API);
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API}/batches`);
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API}/branches`);
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  // ── Toggle notification setting ───────────────
  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ── Save notification settings ────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(API, settings);
      alert("Settings saved ✅");
    } catch (err) {
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  // ── Batch handlers ────────────────────────────
  const handleCreateBatch = async () => {
    if (!newBatch.trim()) return alert("Please enter a batch name");
    try {
      await axios.post(`${API}/batches`, { name: newBatch.trim() });
      setNewBatch("");
      fetchBatches();
      alert(`Batch '${newBatch.trim()}' created ✅`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create batch");
    }
  };

  const handleActivateBatch = async (name) => {
    try {
      await axios.put(`${API}/batches/${encodeURIComponent(name)}/activate`);
      fetchBatches();
      alert(`Batch '${name}' is now active ✅`);
    } catch (err) {
      alert("Failed to activate batch");
    }
  };

  const handleArchiveBatches = async () => {
    if (!window.confirm("Archive all non-active batches?")) return;
    try {
      await axios.put(`${API}/batches/archive`);
      fetchBatches();
      alert("Non-active batches archived ✅");
    } catch (err) {
      alert("Failed to archive batches");
    }
  };

  // ── Branch handlers ───────────────────────────
  const handleAddBranch = async () => {
    if (!newBranch.trim()) return alert("Please enter a branch name");
    try {
      await axios.post(`${API}/branches`, { name: newBranch.trim() });
      setNewBranch("");
      fetchBranches();
      alert(`Branch '${newBranch.trim().toUpperCase()}' added ✅`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add branch");
    }
  };

  const handleEditBranch = async (oldName) => {
    if (!editBranchName.trim()) return;
    try {
      await axios.put(`${API}/branches/${encodeURIComponent(oldName)}`, { name: editBranchName.trim() });
      setEditingBranch(null);
      setEditBranchName("");
      fetchBranches();
      alert("Branch updated ✅");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to edit branch");
    }
  };

  const handleDeleteBranch = async (name) => {
    if (!window.confirm(`Delete branch '${name}'?`)) return;
    try {
      await axios.delete(`${API}/branches/${encodeURIComponent(name)}`);
      fetchBranches();
      alert(`Branch '${name}' deleted ✅`);
    } catch (err) {
      alert("Failed to delete branch");
    }
  };

  // ── Data Export handlers ──────────────────────
  const handleExportExcel = async () => {
    try {
      const [studRes, compRes, offerRes] = await Promise.all([
        axios.get(`${API}/export/students`),
        axios.get(`${API}/export/companies`),
        axios.get(`${API}/export/offers`),
      ]);
      const allData = [
        ...studRes.data.map(s => ({ type: "Student", ...s })),
        ...compRes.data.map(c => ({ type: "Company", ...c })),
        ...offerRes.data.map(o => ({ type: "Offer", ...o })),
      ];
      exportToExcel(allData, "placement_data_export");
      alert("Excel exported ✅");
    } catch (err) {
      alert("Export failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      const [studRes, compRes, offerRes] = await Promise.all([
        axios.get(`${API}/export/students`),
        axios.get(`${API}/export/companies`),
        axios.get(`${API}/export/offers`),
      ]);
      const allData = [
        ...studRes.data.map(s => ({ type: "Student", ...s })),
        ...compRes.data.map(c => ({ type: "Company", ...c })),
        ...offerRes.data.map(o => ({ type: "Offer", ...o })),
      ];
      exportToCSV(allData, "placement_data_export");
      alert("CSV exported ✅");
    } catch (err) {
      alert("Export failed");
    }
  };

  // ── Backup Upload ─────────────────────────────
  const handleBackupUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        alert(`Backup file loaded: ${Object.keys(data).length} keys found. Restore feature coming soon.`);
      } catch {
        alert("Invalid backup file");
      }
    };
    input.click();
  };

  // ── Purge test data ───────────────────────────
  const handlePurge = async () => {
    if (!window.confirm("This will permanently remove all test/dummy data. Continue?")) return;
    try {
      const res = await axios.delete(`${API}/purge-test`);
      alert(res.data.message);
    } catch (err) {
      alert("Purge failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Admin Settings</h1>
        <p className="text-gray-500 text-sm">
          System configuration and management
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BATCH MANAGEMENT */}
        <div className="card">
          <h2 className="font-semibold mb-4">Batch Management</h2>

          <label className="text-sm font-medium">Active Batch</label>
          <select
            className="input-field mt-1 mb-3"
            value={batches.find(b => b.active)?.name || ""}
            onChange={(e) => handleActivateBatch(e.target.value)}
          >
            {batches.map(b => (
              <option key={b.name} value={b.name}>
                {b.name} {b.active ? "(Active)" : ""} {b.archived ? "(Archived)" : ""}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium">Create New Batch</label>
          <div className="flex gap-2 mt-1">
            <input
              className="input-field"
              placeholder="e.g. 2025-2029"
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
            />
            <button className="btn-primary flex-shrink-0" onClick={handleCreateBatch}>Create</button>
          </div>

          <button className="btn-outline w-full mt-3" onClick={handleArchiveBatches}>
            Archive Completed Batches
          </button>
        </div>

        {/* BRANCH MANAGEMENT */}
        <div className="card">
          <h2 className="font-semibold mb-4">Branch Management</h2>

          <div className="space-y-2 mb-4">
            {branches.map(b => (
              <div key={b.name} className="flex items-center justify-between border rounded-lg px-3 py-2">
                {editingBranch === b.name ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      className="input-field flex-1"
                      value={editBranchName}
                      onChange={(e) => setEditBranchName(e.target.value)}
                    />
                    <button className="btn-primary text-xs px-3" onClick={() => handleEditBranch(b.name)}>Save</button>
                    <button className="btn-outline text-xs px-3" onClick={() => setEditingBranch(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{b.name}</span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => { setEditingBranch(b.name); setEditBranchName(b.name); }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 text-sm hover:underline"
                        onClick={() => handleDeleteBranch(b.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input-field"
              placeholder="New branch name"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
            />
            <button className="btn-primary flex-shrink-0" onClick={handleAddBranch}>Add</button>
          </div>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="card">
          <h2 className="font-semibold mb-4">Notification Settings</h2>

          {renderToggle("New Offer Alert", "Notify students when new offers are posted", settings.new_offer_alert, () => toggle("new_offer_alert"))}

          {renderToggle("Submission Confirmation", "Email student on submission", settings.submission_confirmation, () => toggle("submission_confirmation"))}

          {renderToggle("Verification Update", "Notify when approved/rejected", settings.verification_update, () => toggle("verification_update"))}

          {renderToggle("Deadline Reminder", "Remind before deadlines", settings.deadline_reminder, () => toggle("deadline_reminder"))}

          {renderToggle("Admin Alerts", "Notify admin for submissions", settings.admin_alerts, () => toggle("admin_alerts"))}
        </div>

        {/* DATA MANAGEMENT */}
        <div className="card">
          <h2 className="font-semibold mb-4">Data Management</h2>

          <button className="btn-outline w-full mb-2" onClick={handleExportExcel}>
            Export All Data (Excel)
          </button>

          <button className="btn-outline w-full mb-2" onClick={handleExportCSV}>
            Export All Data (CSV)
          </button>

          <button className="btn-outline w-full mb-2" onClick={handleBackupUpload}>
            Upload Backup File
          </button>

          <button
            className="border border-red-400 text-red-500 w-full py-2 rounded hover:bg-red-50 transition-colors"
            onClick={handlePurge}
          >
            Purge Test / Dummy Data
          </button>
        </div>

        {/* EMAIL TEMPLATES */}
        <div className="card">
          <h2 className="font-semibold mb-4">Email Templates</h2>

          {renderTemplate("Offer Alert")}
          {renderTemplate("Submission Confirmation")}
          {renderTemplate("Verification Approved")}
          {renderTemplate("Verification Rejected")}
        </div>

        {/* SECURITY */}
        <div className="card">
          <h2 className="font-semibold mb-4">Security Settings</h2>

          <label className="text-sm">Session Timeout (minutes)</label>
          <input className="input-field mt-1 mb-3" defaultValue="30" />

          {renderToggle("Two-Factor Authentication", "", false, () => {})}

          {renderToggle("Rate Limit Login Attempts", "", true, () => {})}

          <button className="btn-outline w-full mt-3" onClick={() => alert("Login activity log feature coming soon.")}>
            View Login Activity Log
          </button>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 disabled:opacity-50">
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}

/* ------------------ HELPERS ------------------ */

function renderToggle(title, sub, value, onClick) {
  return (
    <div className="flex justify-between items-center py-3 border-b">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>

      <button
        onClick={onClick}
        className={`w-10 h-5 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
            value ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

function renderTemplate(name) {
  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span>{name}</span>
      <button className="text-blue-600 text-sm" onClick={() => alert(`Edit template for "${name}" — feature coming soon.`)}>Edit Template</button>
    </div>
  );
}