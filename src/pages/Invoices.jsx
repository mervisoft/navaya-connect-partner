import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, Download, Search, Filter, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import DataTable from '@/components/shared/DataTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'invoice_number', 
      label: 'Rechnungs-Nr.',
      render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span>
    },
    { 
      key: 'title', 
      label: 'Bezeichnung',
      render: (val) => <span className="text-slate-700">{val}</span>
    },
    { 
      key: 'invoice_date', 
      label: 'Rechnungsdatum',
      render: (val, row) => {
        const date = val || row.created_date;
        return date ? format(new Date(date), 'dd.MM.yyyy', { locale: de }) : '-';
      }
    },
    { 
      key: 'due_date', 
      label: 'Fällig',
      render: (val, row) => {
        if (!val) return '-';
        const isOverdue = isPast(new Date(val)) && row.status !== 'bezahlt';
        return (
          <span className={isOverdue ? 'text-rose-600 font-medium' : ''}>
            {format(new Date(val), 'dd.MM.yyyy', { locale: de })}
            {isOverdue && <AlertCircle className="inline h-3 w-3 ml-1" />}
          </span>
        );
      }
    },
    { 
      key: 'amount', 
      label: 'Betrag',
      render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
  ];

  const openAmount = invoices
    .filter(i => i.status === 'offen' || i.status === 'überfällig')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rechnungen"
        subtitle="Übersicht aller Rechnungen"
        icon={Receipt}
      />

      {/* Summary Card */}
      {openAmount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium">Offene Rechnungen</p>
              <p className="text-2xl font-bold text-amber-900">{formatCurrency(openAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Rechnungs-Nr. oder Bezeichnung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="offen">Offen</SelectItem>
            <SelectItem value="bezahlt">Bezahlt</SelectItem>
            <SelectItem value="überfällig">Überfällig</SelectItem>
            <SelectItem value="storniert">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {!isLoading && filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Keine Rechnungen gefunden"
          description={search || statusFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Es sind noch keine Rechnungen vorhanden"
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          isLoading={isLoading}
          onRowClick={setSelectedInvoice}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedInvoice?.invoice_number}</span>
                <p className="text-sm font-normal text-slate-500">{selectedInvoice?.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Betrag</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Rechnungsdatum</p>
                  <p className="font-medium text-slate-700">
                    {(selectedInvoice.invoice_date || selectedInvoice.created_date) && 
                      format(new Date(selectedInvoice.invoice_date || selectedInvoice.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Fälligkeitsdatum</p>
                  <p className="font-medium text-slate-700">
                    {selectedInvoice.due_date 
                      ? format(new Date(selectedInvoice.due_date), 'dd. MMMM yyyy', { locale: de })
                      : '-'
                    }
                  </p>
                </div>
              </div>

              {selectedInvoice.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Positionen</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">Beschreibung</th>
                          <th className="text-right px-4 py-3">Menge</th>
                          <th className="text-right px-4 py-3">Einzelpreis</th>
                          <th className="text-right px-4 py-3">Gesamt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-700">{item.description}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedInvoice.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedInvoice.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Rechnung herunterladen
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}