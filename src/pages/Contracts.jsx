import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileCheck, Download, Search, Filter, Calendar, RefreshCw, Hash, Monitor } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
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

export default function Contracts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const { t } = useTranslation();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.contract_number?.toLowerCase().includes(search.toLowerCase()) ||
      contract.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBillingLabel = (cycle, row) => {
    if (cycle === 'jährlich') return `${formatCurrency(row.monthly_amount)}/${t('contracts.perYear')}`;
    if (cycle === 'vierteljährlich') return `${formatCurrency(row.monthly_amount)}/${t('contracts.perQuarter')}`;
    return `${formatCurrency(row.monthly_amount)}/${t('contracts.perMonth')}`;
  };

  const columns = [
    { key: 'contract_number', label: t('contracts.contractNumber'), render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span> },
    { key: 'title', label: t('contracts.label'), render: (val) => <span className="text-slate-700">{val}</span> },
    { key: 'start_date', label: t('contracts.duration'), render: (val, row) => {
      if (!val) return '-';
      const start = format(new Date(val), 'dd.MM.yy', { locale: de });
      const end = row.end_date ? format(new Date(row.end_date), 'dd.MM.yy', { locale: de }) : t('contracts.unlimited');
      return `${start} - ${end}`;
    }},
    { key: 'monthly_amount', label: t('contracts.amount'), render: (val, row) => (
      <div>
        <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>
        <span className="text-xs text-slate-500 ml-1">/{row.billing_cycle === 'jährlich' ? t('contracts.perYear') : row.billing_cycle === 'vierteljährlich' ? t('contracts.perQuarter') : t('contracts.perMonth')}</span>
      </div>
    )},
    { key: 'auto_renew', label: t('contracts.renewal'), render: (val) => val ? (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium"><RefreshCw className="h-3 w-3" />{t('contracts.renewalAuto')}</span>
    ) : (
      <span className="text-slate-500 text-xs">{t('contracts.renewalManual')}</span>
    )},
    { key: 'status', label: t('common.status'), render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('contracts.title')} subtitle={t('contracts.subtitle')} icon={FileCheck} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('contracts.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('contracts.allStatus')}</SelectItem>
            <SelectItem value="aktiv">{t('contracts.statusActive')}</SelectItem>
            <SelectItem value="gekündigt">{t('contracts.statusTerminated')}</SelectItem>
            <SelectItem value="ausgelaufen">{t('contracts.statusExpired')}</SelectItem>
            <SelectItem value="entwurf">{t('contracts.statusDraft')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredContracts.length === 0 ? (
        <EmptyState icon={FileCheck} title={t('contracts.noFound')} description={search || statusFilter !== 'all' ? t('contracts.noFoundSearch') : t('contracts.noFoundEmpty')} />
      ) : (
        <DataTable columns={columns} data={filteredContracts} isLoading={isLoading} onRowClick={setSelectedContract} />
      )}

      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-mono">{selectedContract?.contract_number}</span>
                <p className="text-sm font-normal text-slate-500">{selectedContract?.title}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('common.status')}</p>
                  <StatusBadge status={selectedContract.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('contracts.amount')}</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedContract.monthly_amount)}</p>
                  <p className="text-xs text-slate-500">
                    {selectedContract.billing_cycle === 'jährlich' ? t('contracts.billingYearly') : selectedContract.billing_cycle === 'vierteljährlich' ? t('contracts.billingQuarterly') : t('contracts.billingMonthly')}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('contracts.startDate')}</p>
                  <p className="font-medium text-slate-700">{selectedContract.start_date ? format(new Date(selectedContract.start_date), 'dd. MMMM yyyy', { locale: de }) : '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t('contracts.endDate')}</p>
                  <p className="font-medium text-slate-700">{selectedContract.end_date ? format(new Date(selectedContract.end_date), 'dd. MMMM yyyy', { locale: de }) : t('contracts.unlimited')}</p>
                </div>
              </div>

              {selectedContract.status === 'aktiv' && selectedContract.end_date && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800">{t('contracts.remainingTime')}</p>
                      <p className="text-sm text-blue-600">{t('contracts.remainingDays', { days: differenceInDays(new Date(selectedContract.end_date), new Date()) })}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <RefreshCw className={`h-5 w-5 ${selectedContract.auto_renew ? 'text-emerald-500' : 'text-slate-400'}`} />
                <div>
                  <p className="font-medium text-slate-700">{selectedContract.auto_renew ? t('contracts.autoRenewActive') : t('contracts.autoRenewInactive')}</p>
                  <p className="text-sm text-slate-500">{selectedContract.auto_renew ? t('contracts.autoRenewDesc') : t('contracts.noAutoRenewDesc')}</p>
                </div>
              </div>

              {selectedContract.product_line && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Produkt</p>
                    <p className="font-semibold text-slate-800">{selectedContract.product_line}</p>
                  </div>
                  {selectedContract.edition && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Edition</p>
                      <p className="font-semibold text-slate-800">{selectedContract.edition}</p>
                    </div>
                  )}
                  {selectedContract.seats && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Seats</p>
                      <p className="font-semibold text-slate-800">{selectedContract.seats}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedContract.serial_numbers?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-slate-500" />
                    <h4 className="font-semibold text-slate-700">Seriennummern ({selectedContract.serial_numbers.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedContract.serial_numbers.map((sn, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-mono text-sm font-semibold text-slate-800 tracking-wide">{sn.serial}</p>
                            {sn.seat_name && <p className="text-xs text-slate-500">{sn.seat_name}</p>}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${sn.status === 'aktiv' ? 'bg-emerald-100 text-emerald-700' : sn.status === 'gesperrt' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {sn.status === 'aktiv' ? 'Aktiv' : sn.status === 'gesperrt' ? 'Gesperrt' : 'Abgelaufen'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedContract.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedContract.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    {t('contracts.download')}
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