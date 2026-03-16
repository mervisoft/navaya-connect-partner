import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, Download, Search, Filter, AlertCircle, Send, MessageSquare } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
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

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date'),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ invoiceId, comment }) => {
      const invoice = invoices.find(i => i.id === invoiceId);
      const updatedComments = [
        ...(invoice.comments || []),
        {
          author: currentUser?.full_name || currentUser?.email || 'Kunde',
          message: comment,
          date: new Date().toISOString(),
          is_customer_comment: true,
        }
      ];
      return base44.entities.Invoice.update(invoiceId, { comments: updatedComments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setNewComment('');
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedInvoice) return;
    addCommentMutation.mutate({ invoiceId: selectedInvoice.id, comment: newComment });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'invoice_number', label: t('invoices.invoiceNumber'), render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span> },
    { key: 'title', label: t('invoices.label'), render: (val) => <span className="text-slate-700">{val}</span> },
    { key: 'invoice_date', label: t('invoices.invoiceDate'), render: (val, row) => { const date = val || row.created_date; return date ? format(new Date(date), 'dd.MM.yyyy', { locale: de }) : '-'; } },
    { key: 'due_date', label: t('invoices.dueDate'), render: (val, row) => {
      if (!val) return '-';
      const isOverdue = isPast(new Date(val)) && row.status !== 'bezahlt';
      return <span className={isOverdue ? 'text-rose-600 font-medium' : ''}>{format(new Date(val), 'dd.MM.yyyy', { locale: de })}{isOverdue && <AlertCircle className="inline h-3 w-3 ml-1" />}</span>;
    }},
    { key: 'amount', label: t('invoices.amount'), render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span> },
    { key: 'status', label: t('common.status'), render: (val) => <StatusBadge status={val} /> },
  ];

  const openAmount = invoices
    .filter(i => i.status === 'offen' || i.status === 'überfällig')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title={t('invoices.title')} subtitle={t('invoices.subtitle')} icon={Receipt} />

      {openAmount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium">{t('invoices.openInvoices')}</p>
              <p className="text-2xl font-bold text-amber-900">{formatCurrency(openAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('invoices.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('invoices.allStatus')}</SelectItem>
            <SelectItem value="offen">{t('invoices.statusOpen')}</SelectItem>
            <SelectItem value="bezahlt">{t('invoices.statusPaid')}</SelectItem>
            <SelectItem value="überfällig">{t('invoices.statusOverdue')}</SelectItem>
            <SelectItem value="storniert">{t('invoices.statusCancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredInvoices.length === 0 ? (
        <EmptyState icon={Receipt} title={t('invoices.noFound')} description={search || statusFilter !== 'all' ? t('invoices.noFoundSearch') : t('invoices.noFoundEmpty')} />
      ) : (
        <DataTable columns={columns} data={filteredInvoices} isLoading={isLoading} onRowClick={setSelectedInvoice} />
      )}

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
                  <p className="text-xs text-slate-500 mb-1">{t('common.status')}</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('invoices.amount')}</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('invoices.invoiceDate')}</p>
                  <p className="font-medium text-slate-700">
                    {(selectedInvoice.invoice_date || selectedInvoice.created_date) &&
                      format(new Date(selectedInvoice.invoice_date || selectedInvoice.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('invoices.dueDate')}</p>
                  <p className="font-medium text-slate-700">
                    {selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'dd. MMMM yyyy', { locale: de }) : '-'}
                  </p>
                </div>
              </div>

              {selectedInvoice.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">{t('invoices.positions')}</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">{t('invoices.description')}</th>
                          <th className="text-right px-4 py-3">{t('invoices.quantity')}</th>
                          <th className="text-right px-4 py-3">{t('invoices.unitPrice')}</th>
                          <th className="text-right px-4 py-3">{t('invoices.total')}</th>
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
                    {t('invoices.download')}
                  </a>
                </Button>
              )}

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('invoices.comments')}
                </h4>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {!selectedInvoice.comments || selectedInvoice.comments.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">{t('invoices.noComments')}</p>
                  ) : (
                    selectedInvoice.comments.map((comment, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-700">{comment.author}</span>
                          <span className="text-xs text-slate-400">{comment.date && format(new Date(comment.date), 'dd.MM.yy HH:mm', { locale: de })}</span>
                        </div>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-800">
                  {t('invoices.commentHint')}
                </div>
                <div className="flex gap-2">
                  <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('invoices.commentPlaceholder')} className="flex-1 min-h-[80px]" />
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || addCommentMutation.isPending} className="self-end bg-[#1e3a5f] hover:bg-[#2d4a6f]">
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