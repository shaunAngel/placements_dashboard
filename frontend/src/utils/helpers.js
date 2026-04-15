import * as XLSX from 'xlsx';

export const formatPackage = (pkg) => {
  if (!pkg) return '—';
  if (typeof pkg === 'string') return pkg;
  return `${pkg.toFixed(2)} LPA`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

export const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN');
};

export const getPlacementPercent = (placed, total) => {
  if (!total) return '0%';
  return `${((placed / total) * 100).toFixed(1)}%`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Placed':   return 'badge-success';
    case 'Unplaced': return 'badge-gray';
    case 'PPO':      return 'badge-accent';
    case 'Intern':   return 'badge-primary';
    default:         return 'badge-gray';
  }
};

export const getOfferStatusColor = (status) => {
  switch (status) {
    case 'Open':     return 'badge-success';
    case 'Closed':   return 'badge-error';
    case 'Upcoming': return 'badge-accent';
    default:         return 'badge-gray';
  }
};

export const getSubmissionStatusColor = (status) => {
  switch (status) {
    case 'Verified': return 'badge-success';
    case 'Pending':  return 'badge-accent';
    case 'Rejected': return 'badge-error';
    default:         return 'badge-gray';
  }
};

export const getCompanyTypeColor = (type) => {
  switch (type) {
    case 'Product': return 'badge-primary';
    case 'Service': return 'badge-primary';
    case 'Core':    return 'badge-accent';
    case 'Startup': return 'badge-success';
    default:        return 'badge-gray';
  }
};

export const exportToExcel = (data, filename = 'report') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename = 'report') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const getDaysLeft = (deadlineStr) => {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const generateAvatarColor = (name) => {
  const colors = [
    '#1A3A6B', '#2a5099', '#F5A623', '#2E7D32', '#D32F2F',
    '#7B1FA2', '#0288D1', '#E64A19', '#00796B', '#5D4037',
  ];
  let hash = 0;
  for (const ch of (name || '')) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
