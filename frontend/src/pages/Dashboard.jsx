import React, { useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Link } from "react-router-dom";
import { 
  Users, 
  GraduationCap, 
  Percent, 
  TrendingUp, 
  Award, 
  Building2, 
  Briefcase,
  CheckCircle
} from "lucide-react";
import { useStudentStore, useCompanyStore, useNotificationStore } from "../store";
import { getInitials, generateAvatarColor, formatDate } from "../utils/helpers";

// KPI Card
function KpiCard({ label, value, icon, iconBg, textColor, badge }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between items-start transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start w-full mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${textColor}`}>
          {icon}
        </div>
        {badge && (
          <div className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-md">
            {badge}
          </div>
        )}
      </div>
      <div>
        <div className={`text-2xl font-bold ${textColor} mb-1`}>{value}</div>
        <div className="text-[13px] font-medium text-gray-500">{label}</div>
      </div>
    </div>
  );
}

// Student Card
function StudentAvatarCard({ student }) {
  const color = generateAvatarColor(student.name);

  return (
    <div className="w-full sm:w-40 card text-center">
      <div
        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: color }}
      >
        {getInitials(student.name)}
      </div>
      <div className="font-semibold text-sm mt-2">{student.name}</div>
      <div className="text-xs text-gray-500">{student.branch}</div>
      <div className="text-accent font-bold mt-1">
        {student.package?.toFixed(1)} LPA
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { students, fetchStudents } = useStudentStore();
  const { companies, fetchCompanies } = useCompanyStore();
  const { fetchNotifications } = useNotificationStore();

  const [overview, setOverview] = React.useState(null);
  const [companyStats, setCompanyStats] = React.useState([]);
  const [branchData, setBranchData] = React.useState([]);

  // 🔥 FETCH EVERYTHING
  useEffect(() => {
    fetchStudents();
    fetchCompanies();
    fetchNotifications();

    const fetchStats = async () => {
      try {
        const overviewRes = await axios.get("http://127.0.0.1:8000/api/stats/overview");
        const companyRes = await axios.get("http://127.0.0.1:8000/api/stats/company-wise");
        const branchRes = await axios.get("http://127.0.0.1:8000/api/branches");

        setOverview(overviewRes.data);
        setCompanyStats(companyRes.data);
        setBranchData(branchRes.data);
      } catch (err) {
        console.error("Dashboard API error:", err);
      }
    };

    fetchStats();
  }, []);

  // Analytics Computations
  const totalStudents = students.length;
  const placedList = students.filter((s) => s.package && s.package > 0);
  const studentsPlaced = placedList.length;

  const distributionData = useMemo(() => {
    if (placedList.length > 0) {
      let below5 = 0, fiveTo10 = 0, tenTo20 = 0, twentyTo30 = 0, above30 = 0;
      placedList.forEach(s => {
        const p = s.package || 0;
        if (p > 0 && p < 5) below5++;
        else if (p >= 5 && p < 10) fiveTo10++;
        else if (p >= 10 && p < 20) tenTo20++;
        else if (p >= 20 && p < 30) twentyTo30++;
        else if (p >= 30) above30++;
      });
      return [
        { name: 'Below 5 LPA', value: below5 },
        { name: '5–10 LPA', value: fiveTo10 },
        { name: '10–20 LPA', value: tenTo20 },
        { name: '20–30 LPA', value: twentyTo30 },
        { name: 'Above 30 LPA', value: above30 },
      ];
    }
    return [
      { name: 'Below 5 LPA', value: 48 },
      { name: '5–10 LPA', value: 198 },
      { name: '10–20 LPA', value: 132 },
      { name: '20–30 LPA', value: 52 },
      { name: 'Above 30 LPA', value: 18 },
    ];
  }, [placedList]);

  const PIE_COLORS = ['#9CA3AF', '#1E3A8A', '#2563EB', '#F5A623', '#D97706'];

  const renderCustomLegend = (props) => {
    const { payload } = props;
    if (!payload) return null;
    const total = payload.reduce((sum, entry) => sum + (entry.payload?.value || 0), 0);

    return (
      <ul className="w-full mt-4 flex flex-col gap-2 text-sm text-gray-500">
        {payload.map((entry, index) => {
          const value = entry.payload?.value || 0;
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return (
            <li key={`item-${index}`} className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span>{entry.value}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-medium mr-1">{value}</span>
                <span className="text-gray-400">({percentage}%)</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const highestPackage = students.length > 0 
    ? Math.max(...students.map((s) => s.package || 0)) 
    : 0;

  const averagePackage = placedList.length > 0
    ? placedList.reduce((sum, s) => sum + (s.package || 0), 0) / placedList.length
    : 0;

  const companiesVisited = companies ? companies.length : 0;

  // KPI
  const kpiData = [
    { label: "Students Placed (2024-25)", value: studentsPlaced, icon: <GraduationCap size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-amber-50", textColor: "text-amber-500", badge: "+7.4%" },
    { label: "Placement Percentage", value: overview ? `${Number(overview.placementPercentage).toFixed(1)}%` : "0%", icon: <Percent size={18} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-slate-50", textColor: "text-slate-800" },
    { label: "Highest Package", value: highestPackage > 0 ? `${highestPackage.toFixed(0)} LPA` : "N/A", icon: <TrendingUp size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-amber-50", textColor: "text-amber-500" },
    { label: "Average Package", value: averagePackage > 0 ? `${averagePackage.toFixed(1)} LPA` : "N/A", icon: <Award size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-slate-50", textColor: "text-slate-800" },
    { label: "Companies Visited", value: companiesVisited, icon: <Building2 size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-green-50", textColor: "text-green-600" },
    { label: "Total Offers Made", value: overview?.totalOffers || 0, icon: <Briefcase size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-amber-50", textColor: "text-amber-500" },
    { label: "Total Students (Batch)", value: totalStudents, icon: <Users size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-slate-50", textColor: "text-slate-800" },
    { label: "Total Selected", value: overview?.totalSelected || 0, icon: <CheckCircle size={20} strokeWidth={2.5} className="opacity-80" />, iconBg: "bg-slate-50", textColor: "text-slate-800" },
  ];

  // Chart
  const chartData = companyStats.map((c) => ({
    company: c.companyName,
    offers: c.totalOffers,
    selected: c.totalSelected,
  }));

  // 🔥 TOP STUDENTS (dynamic)
  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.package || 0) - (a.package || 0))
      .slice(0, 4);
  }, [students]);

  // 🔥 RECENT PLACEMENTS
  const recentPlacements = useMemo(() => {
    return [...students]
      .filter((s) => s.package && s.package > 0)
      .sort((a, b) => {
        const dateA = new Date(a.offerDate || a.updatedAt || 0).getTime();
        const dateB = new Date(b.offerDate || b.updatedAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [students]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="page-title">Placement Dashboard</h1>
        <p className="text-gray-500 text-sm">Real-time placement overview</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* PACKAGE DISTRIBUTION */}
      <div className="card">
        <h2 className="section-title mb-4">Package Distribution</h2>
        <ResponsiveContainer width="100%" height={380}>
          <PieChart margin={{ top: 30, right: 0, bottom: 10, left: 0 }}>
            <Pie
              data={distributionData}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend content={renderCustomLegend} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 2-COLUMN GRID FOR TOP COMPANIES & BRANCH OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHART: Top Companies */}
        <div className="card flex flex-col">
          <h2 className="section-title mb-4">Top Companies</h2>

          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={120} />

                <Tooltip />

                {/* 🔥 OFFERS */}
                <Bar dataKey="offers" fill="#4CAF50" name="Offers" />

                {/* 🔥 SELECTED */}
                <Bar dataKey="selected" fill="#F5A623" name="Selected" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">No company data available</div>
          )}
        </div>

        {/* BRANCH-WISE OVERVIEW */}
        <div className="card flex flex-col">
          <h2 className="section-title mb-4">Branch-wise Overview</h2>

          {branchData && branchData.length > 0 ? (
            <>
              {/* Branch Bar Chart */}
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="placed" name="Placed" fill="#1A3A6B" />
                  <Bar dataKey="totalStudents" name="Total" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>

              {/* Compact Table */}
              <div className="mt-4 overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="p-2 border-b">Branch</th>
                      <th className="p-2 border-b">Total</th>
                      <th className="p-2 border-b">Placed</th>
                      <th className="p-2 border-b">Unplaced</th>
                      <th className="p-2 border-b">Placement %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchData.map((row, i) => (
                      <tr key={i} className="text-sm border-b last:border-0 hover:bg-gray-50">
                        <td className="p-2 font-medium text-gray-700">{row.branch}</td>
                        <td className="p-2">{row.totalStudents}</td>
                        <td className="p-2 font-semibold text-success">{row.placed}</td>
                        <td className="p-2 font-semibold text-error">{row.totalStudents - row.placed}</td>
                        <td className="p-2 font-bold text-primary">{row.placementPercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">No branch data available</div>
          )}
        </div>

      </div>

      {/* 🔥 TOP STUDENTS (FIXED) */}
      <div className="card">
        <div className="flex justify-between mb-4">
          <h2 className="section-title">Top Students</h2>
          <Link to="/reports/leaderboard" className="text-accent text-sm">
            View All
          </Link>
        </div>

        {topStudents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topStudents.map((s, i) => (
              <StudentAvatarCard key={i} student={s} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No student data available</p>
        )}
      </div>

      {/* 🔥 RECENT PLACEMENTS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">Recent Placements</h2>
          <Link to="/reports/student-wise" className="text-primary text-sm font-semibold hover:underline bg-slate-50 px-3 py-1.5 rounded-md">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-2 font-semibold">Student</th>
                <th className="pb-3 px-2 font-semibold">Company</th>
                <th className="pb-3 px-2 font-semibold">Package</th>
                <th className="pb-3 px-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPlacements.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 flex items-center gap-3">
                    {s.profileImage ? (
                      <img
                        src={`http://localhost:8000${s.profileImage}`}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        alt={s.name}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold flex-shrink-0 text-white shadow-sm opacity-90"
                        style={{ backgroundColor: generateAvatarColor(s.name) }}
                      >
                         {getInitials(s.name)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-800 leading-snug">{s.name}</div>
                      <div className="text-[13px] text-gray-500 font-medium">{s.branch}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2 font-semibold text-slate-700">{s.Company || "—"}</td>
                  <td className="py-3 px-2 font-bold text-amber-600">{s.package ? `${s.package.toFixed(2)} LPA` : "—"}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                      s.status?.toLowerCase().includes("placed") ? "bg-green-100 text-green-700" :
                      s.status?.toLowerCase().includes("ppo") ? "bg-yellow-100 text-yellow-700" :
                      s.status?.toLowerCase().includes("intern") ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {s.status || "Placed"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentPlacements.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400 text-sm">No recent placements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}