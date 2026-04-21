import React, { useState } from "react";
import axios from "axios";

// ── Validation Rules ──────────────────────────────────
const validators = {
  name: {
    test: (v) => /^[A-Za-z\s]+$/.test(v.trim()),
    msg: "Name must contain only letters and spaces",
  },
  rollNo: {
    test: (v) => /^\d{5}[A-Za-z]\d{4}$/.test(v.trim()),
    msg: "Roll No format: 24071A3208",
  },
  branch: {
    test: (v) => v.length > 0,
    msg: "Please select a branch",
  },
  batch: {
    test: (v) => v.length > 0,
    msg: "Please select a batch",
  },
  email: {
    test: (v) => /^[^\s@]+@(gmail\.com|vnrvjiet\.in)$/.test(v.trim()),
    msg: "Email must end with @gmail.com or @vnrvjiet.in",
  },
  mobile: {
    test: (v) => /^[6-9]\d{9}$/.test(v.trim()),
    msg: "Mobile: 10 digits, starts with 6/7/8/9",
  },
  company: {
    test: (v) => /^[A-Za-z\s]+$/.test(v.trim()),
    msg: "Company must contain only letters and spaces",
  },
  package: {
    test: (v) => /^\d+(\.\d+)?$/.test(v.trim()) && parseFloat(v) > 0,
    msg: "Package must be a positive number",
  },
};

import { useSettingStore, useSubmissionStore } from "../store";

export default function SubmitOffer() {
  const { branches, batches } = useSettingStore();
  const [step, setStep] = useState(1);

  const initialState = {
    name: "",
    rollNo: "",
    branch: "",
    batch: "",
    email: "",
    mobile: "",
    company: "",
    package: "",
  };

  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate specific fields for the current step
  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      ["name", "rollNo", "branch", "batch", "email", "mobile"].forEach((field) => {
        if (!form[field].trim()) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        } else if (validators[field] && !validators[field].test(form[field])) {
          newErrors[field] = validators[field].msg;
        }
      });
    }

    if (stepNum === 2) {
      ["company", "package"].forEach((field) => {
        if (!form[field].trim()) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        } else if (validators[field] && !validators[field].test(form[field])) {
          newErrors[field] = validators[field].msg;
        }
      });
    }

    if (stepNum === 3) {
      if (!file) {
        newErrors.file = "Please upload an offer letter (PDF only)";
      } else if (!file.name.toLowerCase().endsWith(".pdf")) {
        newErrors.file = "Only PDF files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  const prevStep = () => setStep(step - 1);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !selected.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({ ...prev, file: "Only PDF files are allowed" }));
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "package") {
          formData.append(key, parseFloat(form[key]) || 0);
        } else {
          formData.append(key, form[key]);
        }
      });

      formData.append("file", file);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/offer/submit",
        formData
      );

      alert(res.data.message || "Submitted successfully ✅");

      // Immediately fetch and sync the latest submissions globally
      useSubmissionStore.getState().fetchSubmissions();

      // RESET
      setForm(initialState);
      setFile(null);
      setStep(1);
      setErrors({});

      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    ) : null;

  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-2xl font-semibold mb-1">
        Offer Letter Upload
      </h1>
      <p className="text-gray-500 mb-6">
        Submit your placement offer letter for verification
      </p>

      <div className="bg-white rounded-xl shadow border p-4 sm:p-8 max-w-4xl">

        {/* STEPPER */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {["Student", "Details", "Upload", "Done"].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold
                ${step === i + 1
                  ? "bg-blue-500 text-white"
                  : step > i + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"}`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  step === i + 1
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Student Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`border rounded-lg px-4 py-2 w-full ${errors.name ? 'border-red-400' : ''}`}
                />
                {renderError("name")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll No *</label>
                <input
                  name="rollNo"
                  value={form.rollNo}
                  onChange={handleChange}
                  placeholder="e.g. 24071A3208"
                  className={`border rounded-lg px-4 py-2 w-full ${errors.rollNo ? 'border-red-400' : ''}`}
                />
                {renderError("rollNo")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className={`border rounded-lg px-4 py-2 w-full bg-white ${errors.branch ? 'border-red-400' : ''}`}
                >
                  <option value="">Select Branch</option>
                  {branches.filter(b => b && String(b).trim() !== '').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {renderError("branch")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                <select
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                  className={`border rounded-lg px-4 py-2 w-full bg-white ${errors.batch ? 'border-red-400' : ''}`}
                >
                  <option value="">Select Batch</option>
                  {batches.filter(b => b && String(b).trim() !== '').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {renderError("batch")}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com or example@vnrvjiet.in"
                  className={`border rounded-lg px-4 py-2 w-full ${errors.email ? 'border-red-400' : ''}`}
                />
                {renderError("email")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`border rounded-lg px-4 py-2 w-full ${errors.mobile ? 'border-red-400' : ''}`}
                />
                {renderError("mobile")}
              </div>

            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Placement Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className={`border rounded-lg px-4 py-2 w-full ${errors.company ? 'border-red-400' : ''}`}
                />
                {renderError("company")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA) *</label>
                <input
                  name="package"
                  value={form.package}
                  onChange={handleChange}
                  placeholder="e.g. 12.5"
                  className={`border rounded-lg px-4 py-2 w-full ${errors.package ? 'border-red-400' : ''}`}
                />
                {renderError("package")}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded">
                Back
              </button>
              <button onClick={nextStep} className="bg-orange-500 text-white px-6 py-2 rounded">
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Upload Document
            </h2>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Letter (PDF only) *</label>
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mb-2"
              />
              {renderError("file")}
              {file && (
                <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded">
                Back
              </button>
              <button onClick={nextStep} className="bg-orange-500 text-white px-6 py-2 rounded">
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold text-blue-600 mb-6">
              Confirm & Submit
            </h2>

            <div className="bg-gray-50 p-4 rounded mb-4 space-y-1">
              <p><b>Name:</b> {form.name}</p>
              <p><b>Roll No:</b> {form.rollNo}</p>
              <p><b>Branch:</b> {form.branch}</p>
              <p><b>Batch:</b> {form.batch}</p>
              <p><b>Email:</b> {form.email}</p>
              <p><b>Mobile:</b> {form.mobile}</p>
              <p><b>Company:</b> {form.company}</p>
              <p><b>Package:</b> {form.package} LPA</p>
              <p><b>File:</b> {file?.name}</p>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded">
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Offer"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}