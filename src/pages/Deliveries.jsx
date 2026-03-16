import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Truck, Download, Search, Filter, ExternalLink, Package } from 'lucide-react';
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

export default function Deliveries() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const { t } = useTranslation();

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => base44.entities.DeliveryNote.list('-created_date'),
  });

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch =
      delivery.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
      delivery.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      delivery.tracking_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTrackingUrl = (carrier, trackingNumber) => {
    const carriers = {
      'DHL': `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc=${trackingNumber}`,
      'DPD': `https://tracking.dpd.de/status/de_DE/parcel/${trackingNumber}`,
      'Hermes': `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#${trackingNumber}`,
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'GLS': `https://gls-group.eu/DE/de/paketverfolgung?match=${trackingNumber}`,
    };
    return carriers[carrier] || null;
  };

  const columns = [
    { key: 'delivery_number', label: t('deliveries.deliveryNumber'), render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span> },
    { key: 'order_number', label: t('deliveries.orderNumber'), render: (val) => val ? <span className="font-mono text-slate-600">{val}</span> : '-' },
    { key: 'shipping_date', label: t('deliveries.shippingDate'), render: (val, row) => { const date = val || row.created_date; return date ? format(new Date(date), 'dd.MM.yyyy', { locale: de }) : '-'; } },
    { key: 'carrier', label: t('deliveries.carrier'), render: (val) => val || '-' },
    { key: 'tracking_number', label: t('deliveries.tracking'), render: (val, row) => {
      if (!val) return '-';
      const trackingUrl = getTrackingUrl(row.carrier, val);
      if (trackingUrl) return <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-mono text-sm flex items-center gap-1" onClick={(e) => e.stopPropagation()}>{val} <ExternalLink className="h-3 w-3" /></a>;
      return <span className="font-mono text-sm">{val}</span>;
    }},
    { key: 'status', label: t('common.status'), render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('deliveries.title')} subtitle={t('deliveries.subtitle')} icon={Truck} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('deliveries.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('deliveries.allStatus')}</SelectItem>
            <SelectItem value="in_vorbereitung">{t('deliveries.statusPreparing')}</SelectItem>
            <SelectItem value="versendet">{t('deliveries.statusShipped')}</SelectItem>
            <SelectItem value="zugestellt">{t('deliveries.statusDelivered')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredDeliveries.length === 0 ? (
        <EmptyState icon={Truck} title={t('deliveries.noFound')} description={search || statusFilter !== 'all' ? t('deliveries.noFoundSearch') : t('deliveries.noFoundEmpty')} />
      ) : (
        <DataTable columns={columns} data={filteredDeliveries} isLoading={isLoading} onRowClick={setSelectedDelivery} />
      )}

      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedDelivery?.delivery_number}</span>
                {selectedDelivery?.order_number && <p className="text-sm font-normal text-slate-500">{t('deliveries.orderRef', { number: selectedDelivery.order_number })}</p>}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('common.status')}</p>
                  <StatusBadge status={selectedDelivery.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('deliveries.shippingDate')}</p>
                  <p className="font-medium text-slate-700">
                    {(selectedDelivery.shipping_date || selectedDelivery.created_date) && format(new Date(selectedDelivery.shipping_date || selectedDelivery.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                {selectedDelivery.carrier && <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('deliveries.carrier')}</p><p className="font-medium text-slate-700">{selectedDelivery.carrier}</p></div>}
                {selectedDelivery.tracking_number && <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('deliveries.trackingNumber')}</p><p className="font-mono font-medium text-slate-700">{selectedDelivery.tracking_number}</p></div>}
              </div>

              {selectedDelivery.tracking_number && selectedDelivery.carrier && (
                <Button asChild variant="outline" className="w-full">
                  <a href={getTrackingUrl(selectedDelivery.carrier, selectedDelivery.tracking_number)} target="_blank" rel="noopener noreferrer">
                    <Package className="h-4 w-4 mr-2" />
                    {t('deliveries.trackButton')}
                  </a>
                </Button>
              )}

              {selectedDelivery.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">{t('deliveries.positions')}</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">{t('deliveries.article')}</th>
                          <th className="text-right px-4 py-3">{t('deliveries.quantity')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDelivery.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-700">{item.description}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedDelivery.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedDelivery.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    {t('deliveries.download')}
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