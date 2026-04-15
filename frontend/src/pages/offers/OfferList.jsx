import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Building2, Briefcase, ChevronRight, Pin, Grid3X3, List } from 'lucide-react';
import { useOfferStore, useAuthStore } from '../../store';
import { getOfferStatusColor } from '../../utils/helpers';
import DataTable from '../../components/ui/DataTable';

function CountdownBadge({ daysLeft }) {
  if (daysLeft <= 0) return null;
  const urgent = daysLeft <= 3;
  return (
    <span className={`badge ${urgent ? 'badge-error countdown-urgent' : 'badge-accent'}`}>
      {urgent ? `${daysLeft}d left!` : `${daysLeft} days`}
    </span>
  );
}

function OfferCard({ offer, onClick }) {
  return (
    <div
      onClick={() => onClick(offer)}
      className={`card cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 relative
        ${offer.status === 'Open' ? 'border-l-4 border-l-success' : offer.status === 'Closed' ? 'border-l-4 border-l-error opacity-70' : 'border-l-4 border-l-accent'}`}
    >
      {offer.isPinned && (
        <div className="absolute top-3 right-3">
          <Pin size={14} className="text-accent" />
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
          {offer.companyName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-primary text-sm leading-tight">{offer.role}</div>
          <div className="text-xs text-gray-500 mt-0.5">{offer.companyName}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`badge ${getOfferStatusColor(offer.status)}`}>{offer.status}</span>
        <span className="badge badge-primary">{offer.offerType}</span>
        {offer.daysLeft > 0 && offer.daysLeft <= 7 && <CountdownBadge daysLeft={offer.daysLeft} />}
      </div>
      <div className="text-accent font-bold text-base mb-2">{offer.package}</div>
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <MapPin size={11} /> {offer.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} /> Deadline: {offer.deadline}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
        {(offer.eligibleBranches || []).slice(0, 4).map(b => (
          <span key={b} className="badge badge-gray">{b}</span>
        ))}
        {(offer.eligibleBranches || []).length > 4 && (
          <span className="badge badge-gray">+{offer.eligibleBranches.length - 4}</span>
        )}
      </div>
    </div>
  );
}

export default function OfferList() {
  const { offers } = useOfferStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [view, setView] = useState('card');
  const [filters, setFilters] = useState({ type: 'All', status: 'All', branch: 'All' });

  const isAdmin = user?.role === 'Admin' || user?.role === 'Staff';

  const filtered = useMemo(() => {
    let list = offers;
    if (filters.type !== 'All') list = list.filter(o => o.offerType === filters.type);
    if (filters.status !== 'All') list = list.filter(o => o.status === filters.status);
    if (filters.branch !== 'All') list = list.filter(o => (o.eligibleBranches || []).includes(filters.branch));
    return list;
  }, [offers, filters]);

  const openOffers = filtered.filter(o => o.status === 'Open' || o.status === 'Upcoming');
  const closedOffers = filtered.filter(o => o.status === 'Closed');
  const pinnedOffers = openOffers.filter(o => o.isPinned);
  const unpinnedOffers = openOffers.filter(o => !o.isPinned);

  const columns = [
    { key: 'companyName', label: 'Company', render: v => <span className="font-semibold text-primary">{v}</span> },
    { key: 'role', label: 'Role' },
    { key: 'offerType', label: 'Type', render: v => <span className="badge badge-primary">{v}</span> },
    { key: 'package', label: 'Package' },
    {
      key: 'status', label: 'Status',
      render: v => <span className={`badge ${getOfferStatusColor(v)}`}>{v}</span>,
    },
    { key: 'deadline', label: 'Deadline' },
    { key: 'location', label: 'Location' },
    {
      key: 'daysLeft', label: 'Days Left', accessor: r => r.daysLeft,
      render: (v) => v > 0 ? <CountdownBadge daysLeft={v} /> : '—',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Active Offers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{openOffers.length} open opportunities, {closedOffers.length} closed</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button className="btn-primary flex items-center gap-1.5">
              + Add Offer
            </button>
          )}
          <button onClick={() => setView('card')} className={`p-2.5 rounded-lg border transition-all ${view === 'card' ? 'bg-primary text-white border-primary' : 'border-border text-gray-500 hover:border-primary'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView('list')} className={`p-2.5 rounded-lg border transition-all ${view === 'list' ? 'bg-primary text-white border-primary' : 'border-border text-gray-500 hover:border-primary'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <select className="select-field w-auto" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="PPO">PPO</option>
          </select>
          <select className="select-field w-auto" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Closed">Closed</option>
          </select>
          <select className="select-field w-auto" value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
            <option value="All">All Branches</option>
            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {view === 'card' ? (
        <>
          {/* Pinned */}
          {pinnedOffers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={14} className="text-accent" />
                <h2 className="section-title">Featured Opportunities</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedOffers.map(o => <OfferCard key={o.id} offer={o} onClick={o => navigate(`/offers/${o.id}`)} />)}
              </div>
            </div>
          )}

          {/* Open */}
          <div>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success inline-block" /> Open Offers ({unpinnedOffers.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unpinnedOffers.map(o => <OfferCard key={o.id} offer={o} onClick={o => navigate(`/offers/${o.id}`)} />)}
            </div>
          </div>

          {/* Closed */}
          {closedOffers.length > 0 && (
            <div>
              <h2 className="section-title mb-3 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error inline-block" /> Closed / Expired ({closedOffers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {closedOffers.map(o => <OfferCard key={o.id} offer={o} onClick={o => navigate(`/offers/${o.id}`)} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          filename="offers"
          onRowClick={o => navigate(`/offers/${o.id}`)}
        />
      )}
    </div>
  );
}
