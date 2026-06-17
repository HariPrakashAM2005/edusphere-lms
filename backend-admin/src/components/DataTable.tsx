'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: keyof T;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  actions?: (row: T) => React.ReactNode;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchField,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle sorting
  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter data
  const filteredData = React.useMemo(() => {
    if (!debouncedSearch || !searchField) return data;
    return data.filter((row) => {
      const val = row[searchField];
      if (typeof val === 'string') {
        return val.toLowerCase().includes(debouncedSearch.toLowerCase());
      }
      return false;
    });
  }, [data, debouncedSearch, searchField]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      
      {/* Search Input bar */}
      {searchField && (
        <div className="flex items-center bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xxs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/40 dark:bg-slate-900/40">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable && col.sortKey && handleSort(col.sortKey)}
                  className={`py-3.5 px-4 select-none ${col.sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && col.sortKey === sortKey && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4.5 px-4 align-middle">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="py-4.5 px-4 align-middle text-right">
                      {actions(row)}
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-slate-400">
                  No records match your query.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
