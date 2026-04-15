import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List, Search } from 'lucide-react';
import { useCompanyStore } from '../../store';
import { getCompanyTypeColor } from '../../utils/helpers'; // Ensure this exists or use a local map
import DataTable from '../../components/ui/DataTable';

export default function CompanyList() {
  const { companies, fetchCompanies } = useCompanyStore();
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sector: 'All', branch: 'All' });

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // ✅ Filtering logic mapped to your MongoDB fields
  const filtered = useMemo(() => {
    let list = Array.isArray(companies) ? companies : [];
    
    if (search) {
      list = list.filter(c => c.companyName?.toLowerCase().includes(search.toLowerCase()));
    }
    if (filters.sector !== 'All') {
      list = list.filter(c => c.companySector === filters.sector);
    }
    if (filters.branch !== 'All') {
      list = list.filter(c => c.branches?.includes(filters.branch));
    }
    return list;
  }, [companies, search, filters]);

  // ✅ Columns for Table View
  const columns = [
    {
      key: 'companyName', label: 'Company',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-primary text-xs">
            {v?.[0]}
          </div>
          <span className="font-semibold text-primary">{v}</span>
        </div>
      ),
    },
    { key: 'companySector', label: 'Sector', render: v => <span className="badge badge-info">{v}</span> },
    { key: 'avgPackage', label: 'Avg Package', render: v => `${v} LPA` },
    { key: 'highestPackage', label: 'Highest', render: v => <span className="font-bold text-accent">{v} LPA</span> },
    {
      key: 'branches', label: 'Eligible Branches',
      render: v => (
        <div className="flex flex-wrap gap-1">
          {(v || []).slice(0, 3).map(b => <span key={b} className="badge badge-gray">{b}</span>)}
          {v?.length > 3 && <span className="badge badge-gray">+{v.length - 3}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Placement Companies</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} companies participating</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg border ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-400'}`}><Grid3X3 size={18} /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg border ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400'}`}><List size={18} /></button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 w-full" />
        </div>
        <select className="select-field" value={filters.sector} onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}>
          <option value="All">All Sectors</option>
          <option value="IT">IT</option>
          <option value="Core">Core</option>
          <option value="Finance">Finance</option>
        </select>
        <select className="select-field" value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
          <option value="All">All Branches</option>
          {['CSE', 'CSBS', 'ECE', 'EEE', 'MECH'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Grid View Rendering */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(company => (
            <div
              key={company.companyID}
              onClick={() => navigate(`/companies/${company.companyID}`)}
              className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                  {company.companyName?.[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-sm truncate">{company.companyName}</div>
                  <div className="text-xs text-gray-400">{company.companySector}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                <div>
                  <div className="text-[10px] uppercase text-gray-400">Avg CTC</div>
                  <div className="font-semibold">{company.avgPackage} LPA</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-gray-400">Highest</div>
                  <div className="font-bold text-accent">{company.highestPackage} LPA</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View Rendering */}
      {view === 'list' && (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={(row) => navigate(`/companies/${row.companyID}`)}
        />
      )}
    </div>
  );
}