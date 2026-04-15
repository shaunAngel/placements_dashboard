import React from "react";
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

import { Edit, Upload } from "lucide-react";

export default function Profile() {
  const { user } = useAuthStore();
  const { students } = useStudentStore();
  const { submissions } = useSubmissionStore();

  // ✅ FIXED MATCHING (rollNo based)
  const student =
    students.find((s) => s.rollNo === user?.rollNo) ||
    students.find((s) => s.email === user?.email);

  if (!student) {
    return (
      <div className="card text-center py-12 text-gray-400">
        No profile found for logged-in user
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
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: generateAvatarColor(student.name) }}
            >
              {getInitials(student.name)}
            </div>
            <button className="absolute bottom-0 right-0 bg-accent p-1 rounded-full">
              <Edit size={12} className="text-white" />
            </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400">Email</div>
                <div>{student.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Mobile</div>
                <div>{student.mobile}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">CGPA</div>
                <div>{student.cgpa41 || student.cgpa32}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Company</div>
                <div>{student.Company || "Not Placed"}</div>
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
            defaultValue={student.email}
            className="input-field"
          />
          <input
            type="text"
            defaultValue={student.mobile}
            className="input-field"
          />
          <label className="input-field cursor-pointer">
            Upload photo
            <input type="file" hidden />
          </label>
        </div>

        <div className="text-right mt-4">
          <button className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}