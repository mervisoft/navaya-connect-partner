import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import DataTable from '@/components/shared/DataTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { t } = useTranslation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      order.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'order_number', label: t('orders.orderNumber'), render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span> },
    { key: 'title', label: t('orders.label'), render: (val) => <span className="text-slate-700">{val}</span> },
    { key: 'order_date', label: t('orders.orderDate'), render: (val, row) => { const date = val || row.created_date; return date ? format(new Date(date), 'dd.MM.yyyy', { locale: de }) : '-'; } },
    { key: 'amount', label: t('orders.amount'), render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span> },
    { key: 'status', label: t('common.status'), render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} icon={ShoppingCart} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('orders.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
            <SelectItem value="neu">{t('orders.statusNew')}</SelectItem>
            <SelectItem value="in_bearbeitung">{t('orders.statusProcessing')}</SelectItem>
            <SelectItem value="versendet">{t('orders.statusShipped')}</SelectItem>
            <SelectItem value="abgeschlossen">{t('orders.statusDone')}</SelectItem>
            <SelectItem value="storniert">{t('orders.statusCancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredOrders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title={t('orders.noFound')} description={search || statusFilter !== 'all' ? t('orders.noFoundSearch') : t('orders.noFoundEmpty')} />
      ) : (
        <DataTable columns={columns} data={filteredOrders} isLoading={isLoading} onRowClick={setSelectedOrder} />
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedOrder?.order_number}</span>
                <p className="text-sm font-normal text-slate-500">{selectedOrder?.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('common.status')}</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('orders.totalAmount')}</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedOrder.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-slate-500 mb-1">{t('orders.orderDate')}</p>
                  <p className="font-medium text-slate-700">
                    {(selectedOrder.order_date || selectedOrder.created_date) &&
                      format(new Date(selectedOrder.order_date || selectedOrder.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
              </div>

              {selectedOrder.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">{t('orders.positions')}</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">{t('orders.description')}</th>
                          <th className="text-right px-4 py-3">{t('orders.quantity')}</th>
                          <th className="text-right px-4 py-3">{t('orders.unitPrice')}</th>
                          <th className="text-right px-4 py-3">{t('orders.total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, idx) => (
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

              {selectedOrder.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedOrder.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    {t('orders.download')}
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