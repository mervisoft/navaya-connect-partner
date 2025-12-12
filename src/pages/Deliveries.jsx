import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Truck, Download, Search, Filter, ExternalLink, Package } from 'lucide-react';
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

export default function Deliveries() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);

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
    { 
      key: 'delivery_number', 
      label: 'Lieferschein-Nr.',
      render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span>
    },
    { 
      key: 'order_number', 
      label: 'Auftrags-Nr.',
      render: (val) => val ? <span className="font-mono text-slate-600">{val}</span> : '-'
    },
    { 
      key: 'shipping_date', 
      label: 'Versanddatum',
      render: (val, row) => {
        const date = val || row.created_date;
        return date ? format(new Date(date), 'dd.MM.yyyy', { locale: de }) : '-';
      }
    },
    { 
      key: 'carrier', 
      label: 'Versanddienstleister',
      render: (val) => val || '-'
    },
    { 
      key: 'tracking_number', 
      label: 'Sendungsverfolgung',
      render: (val, row) => {
        if (!val) return '-';
        const trackingUrl = getTrackingUrl(row.carrier, val);
        if (trackingUrl) {
          return (
            <a 
              href={trackingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-700 font-mono text-sm flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {val} <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
        return <span className="font-mono text-sm">{val}</span>;
      }
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
        title="Lieferscheine"
        subtitle="Versand und Sendungsverfolgung"
        icon={Truck}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Lieferschein-Nr., Auftrags-Nr. oder Tracking..."
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
            <SelectItem value="in_vorbereitung">In Vorbereitung</SelectItem>
            <SelectItem value="versendet">Versendet</SelectItem>
            <SelectItem value="zugestellt">Zugestellt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {!isLoading && filteredDeliveries.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Keine Lieferscheine gefunden"
          description={search || statusFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Es sind noch keine Lieferscheine vorhanden"
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredDeliveries}
          isLoading={isLoading}
          onRowClick={setSelectedDelivery}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedDelivery?.delivery_number}</span>
                {selectedDelivery?.order_number && (
                  <p className="text-sm font-normal text-slate-500">Auftrag: {selectedDelivery.order_number}</p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDelivery && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <StatusBadge status={selectedDelivery.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Versanddatum</p>
                  <p className="font-medium text-slate-700">
                    {(selectedDelivery.shipping_date || selectedDelivery.created_date) && 
                      format(new Date(selectedDelivery.shipping_date || selectedDelivery.created_date), 'dd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                {selectedDelivery.carrier && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Versanddienstleister</p>
                    <p className="font-medium text-slate-700">{selectedDelivery.carrier}</p>
                  </div>
                )}
                {selectedDelivery.tracking_number && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Tracking-Nummer</p>
                    <p className="font-mono font-medium text-slate-700">{selectedDelivery.tracking_number}</p>
                  </div>
                )}
              </div>

              {/* Tracking Button */}
              {selectedDelivery.tracking_number && selectedDelivery.carrier && (
                <Button asChild variant="outline" className="w-full">
                  <a 
                    href={getTrackingUrl(selectedDelivery.carrier, selectedDelivery.tracking_number)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Sendung verfolgen
                  </a>
                </Button>
              )}

              {selectedDelivery.items?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Lieferpositionen</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="text-left px-4 py-3">Artikel</th>
                          <th className="text-right px-4 py-3">Menge</th>
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
                    Lieferschein herunterladen
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