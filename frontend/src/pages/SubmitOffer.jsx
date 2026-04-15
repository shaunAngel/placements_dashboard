import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Upload, User, Briefcase, FileText, ShieldCheck } from 'lucide-react';
import { useSubmissionStore, useStudentStore, useAuthStore } from '../store';
import { companies } from '../data/mockData';

const steps = [
  { id: 1, label: 'Student Identity', icon: User },
  { id: 2, label: 'Placement Details', icon: Briefcase },
  { id: 3, label: 'Document Upload', icon: Upload },
  { id: 4, label: 'Declaration', icon: ShieldCheck },
];

const step1Schema = z.object({
  name: z.string().min(2, 'Full name required'),
  rollNo: z.string().min(4, 'Roll number required'),
  branch: z.string().min(1, 'Branch required'),
  batch: z.string().min(1, 'Batch required'),
  personalEmail: z.string().email('Invalid email'),
  contact: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
});

const step2Schema = z.object({
  company: z.string().min(1, 'Company required'),
  role: z.string().min(2, 'Role required'),
  offerType: z.string().min(1, 'Offer type required'),
  package: z.coerce.number().min(0.5, 'Package must be > 0'),
  offerRef: z.string().min(1, 'Offer letter reference required'),
  offerDate: z.string().min(1, 'Offer date required'),
  joiningDate: z.string().optional(),
  location: z.string().min(1, 'Location required'),
});

const step4Schema = z.object({
  declaration: z.literal(true, { errorMap: () => ({ message: 'You must confirm the declaration' }) }),
});

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
              ${currentStep > step.id ? 'bg-success text-white' :
                currentStep === step.id ? 'bg-primary text-white ring-4 ring-primary/20' :
                'bg-gray-200 text-gray-400'}`}
            >
              {currentStep > step.id ? <Check size={18} /> : <step.icon size={16} />}
            </div>
            <div className={`text-xs mt-1.5 font-medium text-center max-w-[80px] leading-tight ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}>
              {step.label}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${currentStep > step.id ? 'bg-success' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormField({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SubmitOffer() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionRef, setSubmissionRef] = useState('');
  const { addSubmission } = useSubmissionStore();
  const { students } = useStudentStore();
  const { user } = useAuthStore();

  const step1Form = useForm({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm({ resolver: zodResolver(step2Schema) });
  const step4Form = useForm({ resolver: zodResolver(step4Schema) });

  const onStep1 = (data) => {
    // Check roll no
    const student = students.find(s => s.rollNo === data.rollNo);
    if (!student) {
      step1Form.setError('rollNo', { message: 'Roll number not found in database' });
      return;
    }
    setFormData(prev => ({ ...prev, ...data, studentId: student.id }));
    setStep(2);
  };

  const onStep2 = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const onStep3 = () => {
    if (!file) { alert('Please upload an offer letter PDF'); return; }
    setStep(4);
  };

  const onStep4 = (data) => {
    const ref = `REF${Date.now()}`;
    addSubmission({
      id: `sub_${Date.now()}`,
      submissionDate: new Date().toISOString().split('T')[0],
      rollNo: formData.rollNo,
      studentId: formData.studentId,
      name: formData.name,
      branch: formData.branch,
      batch: formData.batch,
      company: formData.company,
      package: formData.package,
      offerType: formData.offerType,
      offerLetterRef: formData.offerRef,
      joiningDate: formData.joiningDate,
      location: formData.location,
      status: 'Pending',
      rejectionReason: null,
      verifiedBy: null,
    });
    setSubmissionRef(ref);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="card text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={36} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Submission Successful!</h2>
          <p className="text-gray-500 mb-4">Your offer letter has been submitted for verification.</p>
          <div className="bg-muted rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Reference Number</div>
            <div className="text-xl font-bold text-accent font-mono">{submissionRef}</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-success text-sm mb-6">
            <Check size={16} />
            Confirmation email sent to {formData.personalEmail}
          </div>
          <p className="text-xs text-gray-400 mb-6">Status: <strong>Pending Verification</strong> — The placement cell will review your submission within 2-3 business days.</p>
          <button onClick={() => { setSubmitted(false); setStep(1); setFormData({}); setFile(null); }} className="btn-primary">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Offer Letter Upload</h1>
        <p className="text-gray-500 text-sm mt-0.5">Submit your placement offer letter for verification</p>
      </div>

      <div className="card">
        <StepIndicator currentStep={step} />

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(onStep1)} className="space-y-5 animate-fade-in">
            <h2 className="section-title">Student Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Full Name" required error={step1Form.formState.errors.name?.message}>
                <input {...step1Form.register('name')} className="input-field" placeholder="Enter your full name" />
              </FormField>
              <FormField label="Roll Number" required error={step1Form.formState.errors.rollNo?.message}>
                <input {...step1Form.register('rollNo')} className="input-field" placeholder="e.g. 25CSE001" />
              </FormField>
              <FormField label="Branch" required error={step1Form.formState.errors.branch?.message}>
                <select {...step1Form.register('branch')} className="select-field">
                  <option value="">Select Branch</option>
                  {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CHEM'].map(b => <option key={b}>{b}</option>)}
                </select>
              </FormField>
              <FormField label="Batch / Year" required error={step1Form.formState.errors.batch?.message}>
                <select {...step1Form.register('batch')} className="select-field">
                  <option value="">Select Batch</option>
                  {['2021-25', '2022-26', '2023-27', '2024-28'].map(b => <option key={b}>{b}</option>)}
                </select>
              </FormField>
              <FormField label="Personal Email" required error={step1Form.formState.errors.personalEmail?.message}>
                <input {...step1Form.register('personalEmail')} type="email" className="input-field" placeholder="your@gmail.com" />
              </FormField>
              <FormField label="Mobile Number" required error={step1Form.formState.errors.contact?.message}>
                <input {...step1Form.register('contact')} className="input-field" placeholder="10-digit mobile" />
              </FormField>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary px-8">Next Step</button>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={step2Form.handleSubmit(onStep2)} className="space-y-5 animate-fade-in">
            <h2 className="section-title">Placement Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Company" required error={step2Form.formState.errors.company?.message}>
                <select {...step2Form.register('company')} className="select-field">
                  <option value="">Select Company</option>
                  {companies.slice(0, 40).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="__other__">Other (type below)</option>
                </select>
              </FormField>
              <FormField label="Position / Role" required error={step2Form.formState.errors.role?.message}>
                <input {...step2Form.register('role')} className="input-field" placeholder="e.g. Software Engineer" />
              </FormField>
              <FormField label="Offer Type" required error={step2Form.formState.errors.offerType?.message}>
                <select {...step2Form.register('offerType')} className="select-field">
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="PPO">PPO</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </FormField>
              <FormField label="Package / Stipend (LPA or monthly)" required error={step2Form.formState.errors.package?.message}>
                <input {...step2Form.register('package', { valueAsNumber: true })} type="number" step="0.01" className="input-field" placeholder="e.g. 12.5" />
              </FormField>
              <FormField label="Offer Letter Reference No." required error={step2Form.formState.errors.offerRef?.message}>
                <input {...step2Form.register('offerRef')} className="input-field" placeholder="e.g. TCS/2024/OL001" />
              </FormField>
              <FormField label="Offer Date" required error={step2Form.formState.errors.offerDate?.message}>
                <input {...step2Form.register('offerDate')} type="date" className="input-field" />
              </FormField>
              <FormField label="Joining Date (optional)" error={step2Form.formState.errors.joiningDate?.message}>
                <input {...step2Form.register('joiningDate')} type="date" className="input-field" />
              </FormField>
              <FormField label="Location / City" required error={step2Form.formState.errors.location?.message}>
                <input {...step2Form.register('location')} className="input-field" placeholder="e.g. Hyderabad" />
              </FormField>
            </div>
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-outline">Back</button>
              <button type="submit" className="btn-primary px-8">Next Step</button>
            </div>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="section-title">Document Upload</h2>
            {/* Main file upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Offer Letter PDF <span className="text-error">*</span>
                <span className="font-normal text-gray-400 ml-2">(PDF only, max 5MB)</span>
              </label>
              <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${file ? 'border-success bg-green-50' : 'border-border hover:border-accent hover:bg-accent/5'}`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && f.type === 'application/pdf' && f.size <= 5 * 1024 * 1024) {
                      setFile(f);
                    } else {
                      alert('Please upload a valid PDF file (max 5MB)');
                    }
                  }}
                />
                {file ? (
                  <div className="text-success">
                    <Check size={32} className="mx-auto mb-2" />
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB — Click to replace</div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload size={32} className="mx-auto mb-2" />
                    <div className="font-semibold text-gray-600">Click or drag & drop to upload</div>
                    <div className="text-xs mt-1">PDF files only, maximum 5MB</div>
                  </div>
                )}
              </label>
            </div>

            {/* Additional docs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Additional Documents (optional, up to 3)
                <span className="font-normal text-gray-400 ml-2">Appointment letter, certificate, etc.</span>
              </label>
              <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 hover:bg-muted transition-all">
                <input type="file" accept=".pdf,.jpg,.png" multiple className="hidden" />
                <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                <div className="text-xs text-gray-400">Click to attach additional files</div>
              </label>
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="btn-outline">Back</button>
              <button type="button" onClick={onStep3} className="btn-primary px-8">Next Step</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <form onSubmit={step4Form.handleSubmit(onStep4)} className="space-y-5 animate-fade-in">
            <h2 className="section-title">Review & Declaration</h2>

            {/* Summary */}
            <div className="bg-muted rounded-xl p-4 space-y-3">
              <div className="font-semibold text-primary text-sm mb-2">Submission Summary</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Name', formData.name],
                  ['Roll No', formData.rollNo],
                  ['Branch', formData.branch],
                  ['Batch', formData.batch],
                  ['Company', formData.company],
                  ['Role', formData.role],
                  ['Offer Type', formData.offerType],
                  ['Package', `${formData.package} LPA`],
                  ['Offer Date', formData.offerDate],
                  ['Offer Ref', formData.offerRef],
                  ['Location', formData.location],
                  ['Document', file?.name || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-gray-400 text-xs font-semibold">{k}</div>
                    <div className="text-gray-800 font-medium truncate">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Declaration */}
            <div className="border border-border rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...step4Form.register('declaration')}
                  className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                />
                <span className="text-sm text-gray-700">
                  I confirm that all details provided in this form are accurate, complete, and genuine. 
                  The offer letter document uploaded is an authentic document from the company. 
                  I understand that providing false information may result in disciplinary action.
                </span>
              </label>
              {step4Form.formState.errors.declaration && (
                <p className="text-error text-xs mt-2">{step4Form.formState.errors.declaration.message}</p>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(3)} className="btn-outline">Back</button>
              <button type="submit" className="btn-primary px-8 flex items-center gap-2">
                <ShieldCheck size={16} /> Submit Offer Letter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
