import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Search, Filter, Send, MessageSquare, Check, Square, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import DataTable from '@/components/shared/DataTable';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [newComment, setNewComment] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date'),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ quoteId, comment }) => {
      const quote = quotes.find(q => q.id === quoteId);
      const updatedComments = [
        ...(quote.comments || []),
        {
          author: currentUser?.full_name || currentUser?.email || 'Kunde',
          message: comment,
          date: new Date().toISOString(),
          is_customer_comment: true,
        }
      ];
      return base44.entities.Quote.update(quoteId, { comments: updatedComments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setNewComment('');
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedQuote) return;
    addCommentMutation.mutate({ quoteId: selectedQuote.id, comment: newComment });
  };

  const handleQuoteSelection = (quote) => {
    setSelectedQuote(quote);
    setSelectedItems(quote?.items?.map((_, idx) => idx) || []);
  };

  const toggleItem = (index) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const calculateSelectedTotal = () => {
    if (!selectedQuote?.items) return 0;
    return selectedQuote.items
      .filter((_, idx) => selectedItems.includes(idx))
      .reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleAcceptQuote = () => {
    toast.success('Angebot wurde erfolgreich angenommen! Wir werden uns in Kürze bei Ihnen melden.');
    setSelectedQuote(null);
  };

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
          onRowClick={handleQuoteSelection}
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">Positionen auswählen</h4>
                    <span className="text-sm text-slate-500">
                      {selectedItems.length} von {selectedQuote.items.length} ausgewählt
                    </span>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="w-12 px-4 py-3"></th>
                          <th className="text-left px-4 py-3">Beschreibung</th>
                          <th className="text-right px-4 py-3">Menge</th>
                          <th className="text-right px-4 py-3">Einzelpreis</th>
                          <th className="text-right px-4 py-3">Gesamt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuote.items.map((item, idx) => (
                          <tr 
                            key={idx} 
                            className={`border-t border-slate-100 transition-colors ${
                              selectedItems.includes(idx) ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <Checkbox
                                checked={selectedItems.includes(idx)}
                                onCheckedChange={() => toggleItem(idx)}
                              />
                            </td>
                            <td className={`px-4 py-3 ${selectedItems.includes(idx) ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                              {item.description}
                            </td>
                            <td className={`px-4 py-3 text-right ${selectedItems.includes(idx) ? 'text-slate-600' : 'text-slate-400'}`}>
                              {item.quantity}
                            </td>
                            <td className={`px-4 py-3 text-right ${selectedItems.includes(idx) ? 'text-slate-600' : 'text-slate-400'}`}>
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className={`px-4 py-3 text-right ${selectedItems.includes(idx) ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-right font-semibold text-slate-700">
                            Ausgewählte Summe:
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 text-lg">
                            {formatCurrency(calculateSelectedTotal())}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {selectedQuote.status === 'offen' && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-emerald-900 mb-1">Angebot annehmen</p>
                          <p className="text-sm text-emerald-700">
                            Sie akzeptieren {selectedItems.length} Position{selectedItems.length !== 1 ? 'en' : ''} im Gesamtwert von {formatCurrency(calculateSelectedTotal())}
                          </p>
                        </div>
                        <Button 
                          onClick={handleAcceptQuote}
                          disabled={selectedItems.length === 0}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Jetzt annehmen
                        </Button>
                      </div>
                    </div>
                  )}
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

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Kommentare
                </h4>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {!selectedQuote.comments || selectedQuote.comments.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">Noch keine Kommentare vorhanden</p>
                  ) : (
                    selectedQuote.comments.map((comment, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-700">{comment.author}</span>
                          <span className="text-xs text-slate-400">
                            {comment.date && format(new Date(comment.date), 'dd.MM.yy HH:mm', { locale: de })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-800">
                  Ihre Kommentare werden direkt an weclapp übermittelt und vom Support-Team bearbeitet.
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Schreiben Sie hier Ihre Nachricht..."
                    className="flex-1 min-h-[80px]"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="self-end bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}