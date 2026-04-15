import React, { useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import { useStudentStore } from "../store";
import { getInitials, generateAvatarColor } from "../utils/helpers";

// KPI Card
function KpiCard({ label, value }) {
  return (
    <div className="kpi-card">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// Student Card
function StudentAvatarCard({ student }) {
  const color = generateAvatarColor(student.name);

  return (
    <div className="w-40 card text-center">
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

  const [overview, setOverview] = React.useState(null);
  const [companyStats, setCompanyStats] = React.useState([]);

  // 🔥 FETCH EVERYTHING
  useEffect(() => {
    fetchStudents(); // 👈 dynamic students

    const fetchStats = async () => {
      try {
        const overviewRes = await axios.get("http://127.0.0.1:8000/api/stats/overview");
        const companyRes = await axios.get("http://127.0.0.1:8000/api/stats/company-wise");

        setOverview(overviewRes.data);
        setCompanyStats(companyRes.data);
      } catch (err) {
        console.error("Dashboard API error:", err);
      }
    };

    fetchStats();
  }, []);

  // KPI
  const kpiData = [
    { label: "Total Offers", value: overview?.totalOffers || 0 },
    { label: "Total Selected", value: overview?.totalSelected || 0 },
    {
      label: "Placement %",
      value: overview ? `${Number(overview.placementPercentage).toFixed(2)}%` : "0%",
    },
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="page-title">Placement Dashboard</h1>
        <p className="text-gray-500 text-sm">Real-time placement overview</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* CHART */}
      <div className="card">
        <h2 className="section-title mb-4">Top Companies</h2>

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
          <div className="flex gap-4">
            {topStudents.map((s, i) => (
              <StudentAvatarCard key={i} student={s} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No student data available</p>
        )}
      </div>

    </div>
  );
}