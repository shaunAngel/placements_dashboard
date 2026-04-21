import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAuthStore,
  useStudentStore,
  useSubmissionStore,
  useSettingStore,
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
  const { branches } = useSettingStore();
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isStudent = user?.role === "Student";

  // ── STUDENT PROFILE ──────────────────────────────
  const student =
    students.find((s) => s.rollNo === user?.rollNo) ||
    students.find((s) => s.email === user?.email);

  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
  });

  React.useEffect(() => {
    if (isStudent) {
      useSubmissionStore.getState().fetchSubmissions();
    }
  }, [isStudent]);

  // ── FACULTY / ADMIN PROFILE ──────────────────────
  const [facultyData, setFacultyData] = useState({
    name: user?.name || "",
    facultyId: "",
    branch: "",
    email: user?.email || "",
    mobile: "",
    profession: user?.role || "",
  });
  const [facultyFile, setFacultyFile] = useState(null);
  const [facultyImage, setFacultyImage] = useState(null); // preview URL

  React.useEffect(() => {
    if (student && isStudent) {
      setFormData({
        email: student.email || "",
        mobile: student.mobile || "",
      });
    }
  }, [student, isStudent]);

  React.useEffect(() => {
    if (!isStudent && user) {
      // Load from localStorage if saved
      const saved = localStorage.getItem(`profile_${user.email}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFacultyData(parsed);
        if (parsed.profileImage) {
          setFacultyImage(parsed.profileImage);
        }
      } else {
        setFacultyData({
          name: user.name || "",
          facultyId: "",
          branch: "",
          email: user.email || "",
          mobile: "",
          profession: user.role || "",
        });
      }
    }
  }, [user, isStudent]);

  // ── FACULTY / ADMIN HANDLERS ─────────────────────
  const handleFacultyChange = (e) => {
    setFacultyData({ ...facultyData, [e.target.name]: e.target.value });
  };

  const handleFacultyFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selected.type.toLowerCase())) {
        alert("Only image files (jpg, jpeg, png) are allowed");
        e.target.value = "";
        return;
      }
    }
    setFacultyFile(selected);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setFacultyImage(url);
    }
  };

  const handleFacultySave = () => {
    if (window.confirm("Save your profile changes?")) {
      const toSave = { ...facultyData };
      if (facultyFile) {
        // Convert to base64 for localStorage persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          toSave.profileImage = reader.result;
          localStorage.setItem(`profile_${user.email}`, JSON.stringify(toSave));
          setFacultyImage(reader.result);
          alert("Profile saved successfully!");
        };
        reader.readAsDataURL(facultyFile);
      } else {
        toSave.profileImage = facultyImage;
        localStorage.setItem(`profile_${user.email}`, JSON.stringify(toSave));
        alert("Profile saved successfully!");
      }
    }
  };

  // ── STUDENT HANDLERS ─────────────────────────────
  const handleStudentFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selected.type.toLowerCase())) {
        alert("Only image files (jpg, jpeg, png) are allowed");
        e.target.value = "";
        return;
      }
    }
    setFile(selected);
  };

  const handleSave = async () => {
    if (window.confirm("Are you sure you want to update your profile?")) {
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
        setFile(null);
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

  if (authLoading) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  // ══════════════════════════════════════════════════
  // FACULTY / ADMIN PROFILE VIEW
  // ══════════════════════════════════════════════════
  if (!isStudent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h1 className="page-title">My Profile</h1>

        <div className="card">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              {facultyImage ? (
                <img
                  src={facultyImage}
                  className="w-24 h-24 rounded-2xl object-cover"
                  alt="Profile"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: generateAvatarColor(user?.name) }}
                >
                  {getInitials(user?.name)}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-1">{facultyData.name || user?.name}</h2>
              <div className="text-sm text-gray-500 mb-3">{user?.role}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h2 className="section-title mb-4">Edit Profile</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                value={facultyData.name}
                onChange={handleFacultyChange}
                className="input-field"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
              <input
                name="facultyId"
                value={facultyData.facultyId}
                onChange={handleFacultyChange}
                className="input-field"
                placeholder="Faculty ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                name="branch"
                value={facultyData.branch}
                onChange={handleFacultyChange}
                className="select-field"
              >
                <option value="">Select Branch</option>
                {branches?.filter(b => b && String(b).trim() !== '').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={facultyData.email}
                onChange={handleFacultyChange}
                className="input-field"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                name="mobile"
                value={facultyData.mobile}
                onChange={handleFacultyChange}
                className="input-field"
                placeholder="Mobile Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input
                name="profession"
                value={facultyData.profession}
                onChange={handleFacultyChange}
                className="input-field"
                placeholder="Profession"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (images only)</label>
              <div className="flex items-center gap-3">
                <label className="input-field cursor-pointer flex items-center justify-between flex-1">
                  <span className="truncate text-sm font-medium">
                    {facultyFile
                      ? (facultyFile.name.length > 20
                        ? facultyFile.name.substring(0, 20) + "..."
                        : facultyFile.name)
                      : "Choose image..."}
                  </span>
                  <input type="file" hidden onChange={handleFacultyFileChange} accept="image/*" />
                  <Upload size={16} className="text-gray-400 flex-shrink-0" />
                </label>
              </div>
            </div>
          </div>

          <div className="text-right mt-4">
            <button
              onClick={handleFacultySave}
              className="btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // STUDENT PROFILE VIEW
  // ══════════════════════════════════════════════════

  if (studentsLoading) {
    return <div className="p-12 text-center">Loading student data...</div>;
  }

  if (!student && !authLoading && !studentsLoading) {
    return (
      <div className="card text-center py-12 text-gray-400">
        No profile found for logged-in user ({user?.rollNo})
      </div>
    );
  }

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
              <img
                src={`http://localhost:8000${student.profileImage}`}
                className="w-24 h-24 rounded-2xl object-cover"
                alt="Profile"
              />
            ) : (
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
            <div className="flex items-center gap-3 mb-2 flex-wrap">
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
              <input type="file" hidden onChange={handleStudentFileChange} accept="image/*" />
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