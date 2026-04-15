import React, { useMemo, useState, useEffect } from 'react';
import { useCompanyStore } from '../../store';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { getCompanyTypeColor } from '../../utils/helpers';

export default function CompanyReport() {
  const { companies, fetchCompanies } = useCompanyStore();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    fetchCompanies(); // Reuse existing store logic
  }, [fetchCompanies]);

  // Use 'companySector' to filter as per your MongoDB schema
  const filtered = useMemo(() => {
    let list = Array.isArray(companies) ? companies : [];
    return typeFilter === 'All' ? list : list.filter(c => c.companySector === typeFilter);
  }, [companies, typeFilter]);

  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {v?.[0]}
          </div>
          <div>
            <div className="font-semibold text-primary text-sm">{v}</div>
            <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{row.website}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'companySector', 
      label: 'Sector', 
      render: v => <span className="badge badge-info">{v}</span> 
    },
    { 
      key: 'placedCount', 
      label: 'Students Placed', 
      render: v => <span className="font-bold text-success">{v}</span>
    },
    {
      key: 'avgPackage', 
      label: 'Avg Package', 
      render: v => <span className="font-semibold text-primary">{v} LPA</span>,
    },
    {
      key: 'highestPackage', 
      label: 'Highest Package', 
      render: v => <span className="font-bold text-accent">{v} LPA</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Company-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">Comprehensive placement statistics by company</p>
      </div>

      {/* Re-instated Sector Filters */}
      <div className="flex flex-wrap gap-3">
        {['All', 'IT', 'Core', 'Finance', 'Startup'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              typeFilter === type 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white border border-border text-gray-600 hover:border-primary'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        filename="company-report"
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.companyName || ''} size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Students Placed', selected.placedCount, 'text-success'],
                ['Avg Package', `${selected.avgPackage} LPA`, 'text-primary'],
                ['Highest Package', `${selected.highestPackage} LPA`, 'text-accent']
              ].map(([k, v, color]) => (
                <div key={k} className="bg-muted rounded-xl p-4 text-center border border-border/50">
                  <div className={`text-2xl font-bold ${color}`}>{v}</div>
                  <div className="text-[10px] uppercase font-semibold text-gray-500 mt-1">{k}</div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <h3 className="text-sm font-bold text-primary mb-2">Company Overview</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{selected.companyDesc}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}