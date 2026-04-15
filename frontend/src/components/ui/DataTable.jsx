import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../../utils/helpers';

export default function DataTable({
  data = [],
  columns = [],
  filename = 'report',
  showExport = true,
  pageSize: defaultPageSize = 25,
  onRowClick,
  rowClassName,
}) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSort = (col) => {
    if (col.sortable === false) return;
    if (sortCol === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col.key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find(c => c.key === sortCol);
      const aVal = col?.accessor ? col.accessor(a) : a[sortCol];
      const bVal = col?.accessor ? col.accessor(b) : b[sortCol];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleExportExcel = () => {
    const exportData = filtered.map(row =>
      Object.fromEntries(columns.map(col => [col.label, col.accessor ? col.accessor(row) : row[col.key]]))
    );
    exportToExcel(exportData, filename);
  };

  const handleExportCSV = () => {
    const exportData = filtered.map(row =>
      Object.fromEntries(columns.map(col => [col.label, col.accessor ? col.accessor(row) : row[col.key]]))
    );
    exportToCSV(exportData, filename);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{filtered.length} records</span>
          {showExport && (
            <>
              <button onClick={handleExportExcel} className="btn-outline py-1.5 px-3 flex items-center gap-1.5">
                <Download size={13} /> Excel
              </button>
              <button onClick={handleExportCSV} className="btn-ghost py-1.5 px-3 flex items-center gap-1.5">
                <Download size={13} /> CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-white">
        <table className="w-full min-w-max">
          <thead className="bg-muted border-b border-border">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`table-th ${col.sortable !== false ? 'hover:bg-gray-100' : ''}`}
                  onClick={() => handleSort(col)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <span className="text-gray-300">
                        {sortCol === col.key
                          ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                          : <ChevronsUpDown size={13} />
                        }
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                  No records found
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-muted/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName?.(row) || ''} ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="table-td">
                      {col.render ? col.render(col.accessor ? col.accessor(row) : row[col.key], row) : (col.accessor ? col.accessor(row) : row[col.key]) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="border border-border rounded px-2 py-1 text-sm"
          >
            {[25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-2">Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageIdx = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
            return (
              <button
                key={pageIdx}
                onClick={() => setPage(pageIdx)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors
                  ${page === pageIdx ? 'bg-primary text-white' : 'hover:bg-muted'}`}
              >
                {pageIdx + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
