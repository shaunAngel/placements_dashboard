import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List, Search } from 'lucide-react';
import { useCompanyStore } from '../../store';
import DataTable from '../../components/ui/DataTable';

export default function CompanyList() {
  const { companies, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  // ✅ FIXED FILTER
  const filtered = useMemo(() => {
    let list = companies;

    if (search) {
      list = list.filter(c =>
        c.companyName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return list;
  }, [companies, search]);

  // ✅ FIXED COLUMNS
  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-primary text-xs">
            {v?.[0]}
          </div>
          <span className="font-semibold text-primary">{v}</span>
        </div>
      ),
    },
    {
      key: 'companyID',
      label: 'Company ID',
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Company Details</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} companies listed
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2.5 rounded-lg border ${
              view === 'grid'
                ? 'bg-primary text-white border-primary'
                : 'border-border text-gray-500'
            }`}
          >
            <Grid3X3 size={16} />
          </button>

          <button
            onClick={() => setView('list')}
            className={`p-2.5 rounded-lg border ${
              view === 'list'
                ? 'bg-primary text-white border-primary'
                : 'border-border text-gray-500'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filtered) &&filtered.map(company => (
            <div
              key={company.companyID}   // ✅ FIXED
              onClick={() => navigate(`/companies/${company.companyID}`)}
              className="card cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="font-bold text-primary text-sm">
                {company.companyName}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {company.companyID}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <DataTable
          data={filtered}
          columns={columns}
          filename="companies"
          onRowClick={(row) =>
            navigate(`/companies/${row.companyID}`)
          }
        />
      )}
    </div>
  );
}