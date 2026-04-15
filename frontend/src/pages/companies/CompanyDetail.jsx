import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, CheckCircle, XCircle, Download, 
  Users, TrendingUp, Briefcase, Building2 
} from 'lucide-react';
import axios from 'axios';
import { getCompanyTypeColor } from '../../utils/helpers';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        // Using the "full" endpoint to get both company info and drive records
        const res = await axios.get(`http://127.0.0.1:8000/api/companies/${id}/full`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching full company details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullDetails();
  }, [id]);

  // Dynamic calculations based on DB records
  // ✅ Direct use of backend-calculated weighted stats
  const stats = useMemo(() => {
    return {
      avg: data?.company?.avgPackage || 0,
      high: data?.company?.highestPackage || 0,
      total: data?.company?.placedCount || 0
    };
  }, [data]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading data from MongoDB...</div>;
  if (!data?.company) return <div className="p-10 text-center">Company Not Found</div>;

  const { company, records } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation */}
      <button onClick={() => navigate('/companies')} className="btn-ghost flex items-center gap-2 text-sm">
        <ArrowLeft size={16} /> Back to Companies
      </button>

      {/* Header Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold text-3xl border border-border shadow-sm">
            {company.companyName?.[0]}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-primary">{company.companyName}</h1>
              <span className={`badge badge-info`}>{company.companySector}</span>
              <span className="badge badge-success flex items-center gap-1">
                <CheckCircle size={11} /> Active
              </span>
            </div>
            
            <a href={company.website} target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center gap-1.5 text-accent hover:underline text-sm font-medium">
              <Globe size={14} /> {company.website}
            </a>
          </div>

          {/* Real-time Stats from Drive Collection */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            {[
              { icon: Users, label: 'Placed', value: stats.total, color: 'text-primary' },
              { icon: TrendingUp, label: 'Avg Pkg', value: `${stats.avg} LPA`, color: 'text-primary' },
              { icon: Briefcase, label: 'Highest', value: `${stats.high} LPA`, color: 'text-accent' },
            ].map(s => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center min-w-[90px]">
                <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
                <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase text-gray-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="card">
            <h2 className="section-title mb-3">About {company.companyName}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {company.companyDesc || "No description available for this company."}
            </p>
          </div>

          {/* Hiring Records (Dynamic from drive_collection) */}
          <div className="card">
            <h2 className="section-title mb-4">Hiring History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="table-th text-left p-3">Role Type</th>
                    <th className="table-th text-center p-3">Offers</th>
                    <th className="table-th text-center p-3">Selected</th>
                    <th className="table-th text-center p-3">Year</th>
                    <th className="table-th text-right p-3">Package (CTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3 font-medium text-primary">{rec.roleType}</td>
                      <td className="p-3 text-center">{rec.totalOffers}</td>
                      <td className="p-3 text-center text-success font-semibold">{rec.totalSelected}</td>
                      <td className="p-3 text-center">{rec.year}</td>
                      <td className="p-3 text-right font-bold text-accent">{rec.roleCTC} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF Viewer Placeholder */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Company Profile PDF</h2>
              <button className="btn-outline flex items-center gap-1.5 text-xs py-1.5">
                <Download size={14} /> Download PDF
              </button>
            </div>
            <div className="bg-muted rounded-xl h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-border">
              <Download size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium italic">Document Preview Unavailable</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title mb-4">Interview Mode</h2>
            <div className="space-y-3">
               <div className="flex items-center gap-3 p-2 bg-success/5 rounded-lg border border-success/10">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm font-medium">On-Campus Recruitment</span>
               </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title mb-4">Interview Rounds</h2>
            <div className="space-y-4">
              {[
                { r: 'Aptitude Test', d: 'Logical, Verbal & Quant' },
                { r: 'Technical Interview', d: 'Coding & Core Fundamentals' },
                { r: 'HR Round', d: 'Behavioral & Culture Fit' }
              ].map((round, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">{round.r}</div>
                    <div className="text-xs text-gray-400">{round.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-primary/5 border-primary/10">
            <h2 className="section-title mb-3">Placement Office Contact</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Representative:</span>
                <span className="font-semibold text-primary">Placement Cell</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-success font-bold">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}