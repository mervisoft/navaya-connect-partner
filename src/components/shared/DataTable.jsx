import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable({ columns, data, onRowClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-14 bg-slate-50 border-b border-slate-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-50 flex items-center px-6 gap-4">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/6" />
              <div className="h-4 bg-slate-100 rounded w-1/5" />
              <div className="h-4 bg-slate-100 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-100">
            {columns.map((col) => (
              <TableHead 
                key={col.key} 
                className={`text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.label}
              </TableHead>
            ))}
            {onRowClick && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            if (!row) return null;
            return (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-slate-50 hover:bg-sky-50/50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((col) => (
                  <TableCell key={col.key || col.label} className={`py-4 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : (col.key ? row[col.key] : '')}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className="py-4">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </TableCell>
                )}
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}