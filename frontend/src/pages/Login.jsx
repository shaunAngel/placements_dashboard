import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Please select a role'),
});

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@vnrvjiet.ac.in', label: 'Admin' },
  { role: 'Staff', email: 'placement@vnrvjiet.ac.in', label: 'Placement Staff' },
  { role: 'Faculty', email: 'faculty@vnrvjiet.ac.in', label: 'Faculty' },
  { role: 'Student', email: 'student@vnrvjiet.ac.in', label: 'Student' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const result = login(data);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use password: vnrvjiet@123');
    }
    setLoading(false);
  };

  const fillDemo = (cred) => {
    setValue('email', cred.email);
    setValue('password', 'vnrvjiet@123');
    setValue('role', cred.role);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 border border-white/10" />

        {/* Logo / Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-xl">
              VNR
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">VNRVJIET</div>
              <div className="text-white/60 text-sm">Placement Portal</div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Placement &<br />
            Career Management<br />
            <span className="text-accent">Platform</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-md">
            Track placements, manage companies, view offers, and monitor student career outcomes — all in one place for VNRVJIET.
          </p>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Students Placed', value: '421+' },
              { label: 'Companies', value: '72+' },
              { label: 'Avg Package', value: '9.2 LPA' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-accent font-bold text-2xl">{stat.value}</div>
                <div className="text-white/60 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <div className="text-white/40 text-sm italic">"Tamasoma Jyotirgamaya"</div>
          <div className="text-white/30 text-xs mt-1">VNRVJIET — Hyderabad</div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">VNR</div>
            <div>
              <div className="font-bold text-primary">VNRVJIET</div>
              <div className="text-gray-500 text-xs">Placement Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary">Sign In</h2>
            <p className="text-gray-500 mt-1 text-sm">Access your placement portal account</p>
          </div>

          {/* Demo Quick Login */}
          <div className="mb-6">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Quick Login (Demo)</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => fillDemo(c)}
                  className="py-2 px-3 border border-border rounded-lg text-xs font-medium text-primary hover:border-primary hover:bg-muted transition-all text-left"
                >
                  <span className="block font-semibold">{c.label}</span>
                  <span className="text-gray-400 text-[10px]">{c.email}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login As</label>
              <select {...register('role')} className="select-field">
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Placement Cell Staff</option>
                <option value="Faculty">Faculty</option>
                <option value="Student">Student</option>
              </select>
              {errors.role && <p className="text-error text-xs mt-1">{errors.role.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="yourname@vnrvjiet.ac.in"
                className="input-field"
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-error text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Forgot password? Contact <span className="text-primary font-medium">placement@vnrvjiet.ac.in</span>
          </p>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-gray-400">
              VNRVJIET — Vallurupalli Nageswara Rao Vignana Jyothi<br />Institute of Engineering & Technology, Hyderabad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
