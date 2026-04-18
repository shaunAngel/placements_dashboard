import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAuthStore,
  useStudentStore,
  useSubmissionStore,
} from "../store";

import {
  getStatusColor,
  getSubmissionStatusColor,
  getInitials,
  generateAvatarColor,
  formatDate,
} from "../utils/helpers";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Edit, Upload, Trash2 } from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { students, clearPfp, updateStudent, loading: studentsLoading } = useStudentStore();
  const { submissions } = useSubmissionStore();
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
  });

  // ✅ FIXED MATCHING (rollNo based)
  const student =
    students.find((s) => s.rollNo === user?.rollNo) ||
    students.find((s) => s.email === user?.email);

  React.useEffect(() => {
    if (student) {
      setFormData({
        email: student.email || "",
        mobile: student.mobile || "",
      });
    }
  }, [student]);

  if (authLoading || studentsLoading) {
    return <div className="p-12 text-center">Loading student data...</div>;
  }

  if (!student && !authLoading && !studentsLoading) {
    return (
      <div className="card text-center py-12 text-gray-400">
        No profile found for logged-in user ({user?.rollNo})
      </div>
    );
  }

  const handleSave = async (e) => {
    if (window.confirm("Are you sure you want to update your profile ?")) {
      if (!student) return;
      setIsSaving(true);
      const data = new FormData();
      data.append("email", formData.email);
      data.append("mobile", formData.mobile);
      if (file) data.append("profilePhoto", file);

      const result = await updateStudent(student.rollNo, data);

      setIsSaving(false);
      if (result.success) {
        alert("Profile updated successfully!");
      } else {
        alert("Update failed: " + result.error);
      }
    }
  };

  const handleClearPfp = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      const result = await clearPfp(student.rollNo);
      if (result.success) {
        setFile(null);
      }
    }
  };


  const studentSubmissions = submissions
    .filter((s) => s.rollNo === student.rollNo)
    .slice(0, 5);

  const branchAvg = 8;
  const collegeAvg = 9.2;

  const chartData = [
    { name: "Your Package", value: student.package || 0 },
    { name: `${student.branch} Avg`, value: branchAvg },
    { name: "College Avg", value: collegeAvg },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">My Profile</h1>

      {/* PROFILE CARD */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Avatar */}
          <div className="relative">
            {student.profileImage ? (
              // Show the actual photo if it exists
              <img
                src={`http://localhost:8000${student.profileImage}`}
                className="w-24 h-24 rounded-2xl object-cover"
                alt="Profile"
              />
            ) : (
              // Fallback to Initials if profileImage is null
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: generateAvatarColor(student.name) }}
              >
                {getInitials(student.name)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-primary">
                {student.name}
              </h2>
              <span className={`badge ${getStatusColor(student.status)}`}>
                {student.status}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-3">
              {student.rollNo} · {student.branch}
            </div>

            {/* ✅ FIXED FIELD NAMES */}
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-sm font-medium whitespace-nowrap">
                  {student.email}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Mobile</div>
                <div className="text-sm font-medium">{student.mobile}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">CGPA</div>
                <div className="text-sm font-medium">{student.cgpa41 || student.cgpa32}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Company</div>
                <div className="text-sm font-medium">{student.Company || "Not Placed"}</div>
              </div>
            </div>
          </div>

          {/* Package */}
          {student.package && (
            <div className="bg-muted p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-accent">
                {student.package}
              </div>
              <div className="text-xs text-gray-400">LPA</div>
              <div className="text-xs text-primary">{student.Company}</div>
            </div>
          )}
        </div>
      </div>

      {/* CHART + SUBMISSIONS */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Chart */}
        <div className="card">
          <h2 className="section-title mb-4">Package Comparison</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Submissions */}
        <div className="card">
          <div className="flex justify-between mb-4">
            <h2 className="section-title">My Submissions</h2>
            <Link to="/submit-offer" className="btn-primary text-xs px-3 py-1">
              <Upload size={12} /> New
            </Link>
          </div>

          {studentSubmissions.length === 0 ? (
            <p className="text-gray-400 text-sm">No submissions</p>
          ) : (
            studentSubmissions.map((sub) => (
              <div key={sub.id} className="border p-3 rounded mb-2">
                <div className="flex justify-between">
                  <div>{sub.company}</div>
                  <span className={`badge ${getSubmissionStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {sub.offerType} · {sub.package} LPA ·{" "}
                  {formatDate(sub.submissionDate)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT */}
      <div className="card">
        <h2 className="section-title mb-4">Edit Contact</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder="Email"
          />
          <input
            type="text"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="input-field"
            placeholder="Mobile Number"
          />
          <div className="flex flex-row gap-2">
            <label className="input-field cursor-pointer flex items-center justify-between">
              <span className="truncate text-sm font-medium">
                {file
                  ? (file.name.length > 10
                    ? file.name.substring(0, 10) + "..."
                    : file.name)
                  : "Upload photo"}
              </span>
              <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
              <Upload size={16} className="text-gray-400" />
            </label>

            {/* ONLY SHOW IF USER HAS AN IMAGE */}
            {student.profileImage && (
              <button
                onClick={handleClearPfp}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors group"
                title="Remove profile picture"
              >
                {/* Lucide icon for better visual cue */}
                <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Remove</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}