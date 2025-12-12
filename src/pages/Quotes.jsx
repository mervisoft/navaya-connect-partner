import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
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

export default function Quotes() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      quote.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'quote_number', 
      label: 'Angebots-Nr.',
      render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span>
    },
    { 
      key: 'title', 
      label: 'Titel',
      render: (val) => <span className="text-slate-700">{val}</span>
    },
    { 
      key: 'created_date', 
      label: 'Datum',
      render: (val) => val ? format(new Date(val), 'dd.MM.yyyy', { locale: de }) : '-'
    },
    { 
      key: 'valid_until', 
      label: 'Gültig bis',
      render: (val) => val ? format(new Date(val), 'dd.MM.yyyy', { locale: de }) : '-'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Angebote"
        subtitle="Alle Ihre Angebote auf einen Blick"
        icon={FileText}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Angebots-Nr. oder Titel..."
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
            <SelectItem value="angenommen">Angenommen</SelectItem>
            <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
            <SelectItem value="abgelaufen">Abgelaufen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {!isLoading && filteredQuotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Keine Angebote gefunden"
          description={search || statusFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Es sind noch keine Angebote vorhanden"
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredQuotes}
          isLoading={isLoading}
          onRowClick={setSelectedQuote}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedQuote?.quote_number}</span>
                <p className="text-sm font-normal text-slate-500">{selectedQuote?.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <StatusBadge status={selectedQuote.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Gesamtbetrag</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedQuote.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Erstelldatum</p>
                  <p className="font-medium text-slate-700">
                    {selectedQuote.created_date && format(new Date(selectedQuote.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Gültig bis</p>
                  <p className="font-medium text-slate-700">
                    {selectedQuote.valid_until 
                      ? format(new Date(selectedQuote.valid_until), 'dd. MMMM yyyy', { locale: de })
                      : '-'
                    }
                  </p>
                </div>
              </div>

              {selectedQuote.items?.length > 0 && (
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
                        {selectedQuote.items.map((item, idx) => (
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

              {selectedQuote.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedQuote.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Angebot herunterladen
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