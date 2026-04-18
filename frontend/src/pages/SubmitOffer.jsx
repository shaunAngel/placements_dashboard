import React, { useState } from "react";
import axios from "axios";

export default function SubmitOffer() {
  const [step, setStep] = useState(1);

  const initialState = {
    name: "",
    rollNo: "",
    branch: "",
    batch: "",
    email: "",
    mobile: "",
    company: "",
    package: ""
  };

  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!file) {
      alert("Upload offer letter");
      return;
    }

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

      // RESET
      setForm(initialState);
      setFile(null);
      setStep(1);

      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-1">
        Offer Letter Upload
      </h1>
      <p className="text-gray-500 mb-6">
        Submit your placement offer letter for verification
      </p>

      <div className="bg-white rounded-xl shadow border p-8 max-w-4xl">

        {/* STEPPER */}
        <div className="flex items-center justify-between mb-8">
          {["Student", "Details", "Upload", "Done"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold
                ${step === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"}`}
              >
                {i + 1}
              </div>
              <span
                className={`${
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

            <div className="grid grid-cols-2 gap-6">

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="rollNo"
                value={form.rollNo}
                onChange={handleChange}
                placeholder="Roll No"
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="Branch"
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="Batch"
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="border rounded-lg px-4 py-2 col-span-2"
              />

              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                className="border rounded-lg px-4 py-2"
              />

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

            <div className="grid grid-cols-2 gap-6">
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company"
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="package"
                value={form.package}
                onChange={handleChange}
                placeholder="Package (LPA)"
                className="border rounded-lg px-4 py-2"
              />
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

            <input
              id="fileInput"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mb-6"
            />

            <div className="flex justify-between">
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

            <div className="bg-gray-50 p-4 rounded mb-4">
              <p><b>Name:</b> {form.name}</p>
              <p><b>Company:</b> {form.company}</p>
              <p><b>Package:</b> {form.package} LPA</p>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded">
                Back
              </button>

              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded"
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