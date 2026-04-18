import React, { useState } from "react";

export default function AdminSettings() {
  // ✅ LOCAL STATE ONLY (NO BACKEND)
  const [settings, setSettings] = useState({
    new_offer_alert: true,
    submission_confirmation: true,
    verification_update: true,
    deadline_reminder: true,
    admin_alerts: true,
  });

  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    console.log("Saved Settings:", settings);
    alert("Settings saved (local only) ✅");
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

        {/* BATCH MANAGEMENT (UNCHANGED) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Batch Management</h2>

          <label className="text-sm">Active Batch</label>
          <select className="input mt-1 mb-3">
            <option>2024-28</option>
          </select>

          <label className="text-sm">Create New Batch</label>
          <div className="flex gap-2 mt-1">
            <input className="input" placeholder="e.g. 2025-29" />
            <button className="btn-primary">Create</button>
          </div>

          <button className="btn-outline w-full mt-3">
            Archive Completed Batches
          </button>
        </div>

        {/* NOTIFICATION SETTINGS (ONLY THIS IS FUNCTIONAL) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Notification Settings</h2>

          {renderToggle("New Offer Alert", "Notify students when new offers are posted", settings.new_offer_alert, () => toggle("new_offer_alert"))}

          {renderToggle("Submission Confirmation", "Email student on submission", settings.submission_confirmation, () => toggle("submission_confirmation"))}

          {renderToggle("Verification Update", "Notify when approved/rejected", settings.verification_update, () => toggle("verification_update"))}

          {renderToggle("Deadline Reminder", "Remind before deadlines", settings.deadline_reminder, () => toggle("deadline_reminder"))}

          {renderToggle("Admin Alerts", "Notify admin for submissions", settings.admin_alerts, () => toggle("admin_alerts"))}
        </div>

        {/* DATA MANAGEMENT (STATIC) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Data Management</h2>

          <button className="btn-outline w-full mb-2">
            Export All Data (Excel)
          </button>

          <button className="btn-outline w-full mb-2">
            Export All Data (CSV)
          </button>

          <button className="btn-outline w-full mb-2">
            Upload Backup File
          </button>

          <button className="border border-red-400 text-red-500 w-full py-2 rounded">
            Purge Test / Dummy Data
          </button>
        </div>

        {/* EMAIL TEMPLATES (STATIC) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Email Templates</h2>

          {renderTemplate("Offer Alert")}
          {renderTemplate("Submission Confirmation")}
          {renderTemplate("Verification Approved")}
          {renderTemplate("Verification Rejected")}
        </div>

        {/* SECURITY (STATIC) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Security Settings</h2>

          <label className="text-sm">Session Timeout (minutes)</label>
          <input className="input mt-1 mb-3" defaultValue="30" />

          {renderToggle("Two-Factor Authentication", "", false, () => {})}

          {renderToggle("Rate Limit Login Attempts", "", true, () => {})}

          <button className="btn-outline w-full mt-3">
            View Login Activity Log
          </button>
        </div>

        {/* BULK IMPORT (STATIC) */}
        <div className="card">
          <h2 className="font-semibold mb-4">Bulk Import Students</h2>

          <p className="text-sm text-gray-500 mb-3">
            Import student records using Excel template
          </p>

          <button className="btn-outline w-full mb-2">
            Download Excel Template
          </button>

          <button className="btn-primary w-full">
            Upload Student Excel
          </button>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-6">
          Save All Settings
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
        className={`w-10 h-5 rounded-full ${value ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transform ${
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
      <button className="text-blue-600 text-sm">Edit Template</button>
    </div>
  );
}