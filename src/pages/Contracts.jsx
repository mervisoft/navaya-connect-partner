import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileCheck, Download, Search, Filter, Calendar, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
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

export default function Contracts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contract_number?.toLowerCase().includes(search.toLowerCase()) ||
      contract.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const billingCycleLabels = {
    monatlich: 'Monatlich',
    vierteljährlich: 'Vierteljährlich',
    jährlich: 'Jährlich',
  };

  const columns = [
    { 
      key: 'contract_number', 
      label: 'Vertrags-Nr.',
      render: (val) => <span className="font-mono font-medium text-slate-800">{val}</span>
    },
    { 
      key: 'title', 
      label: 'Bezeichnung',
      render: (val) => <span className="text-slate-700">{val}</span>
    },
    { 
      key: 'start_date', 
      label: 'Laufzeit',
      render: (val, row) => {
        if (!val) return '-';
        const start = format(new Date(val), 'dd.MM.yy', { locale: de });
        const end = row.end_date ? format(new Date(row.end_date), 'dd.MM.yy', { locale: de }) : 'unbefristet';
        return `${start} - ${end}`;
      }
    },
    { 
      key: 'monthly_amount', 
      label: 'Betrag',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>
          <span className="text-xs text-slate-500 ml-1">/{row.billing_cycle === 'jährlich' ? 'Jahr' : row.billing_cycle === 'vierteljährlich' ? 'Quartal' : 'Monat'}</span>
        </div>
      )
    },
    { 
      key: 'auto_renew', 
      label: 'Verlängerung',
      render: (val) => val ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
          <RefreshCw className="h-3 w-3" /> Automatisch
        </span>
      ) : (
        <span className="text-slate-500 text-xs">Manuell</span>
      )
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
        title="Verträge"
        subtitle="Ihre aktiven und vergangenen Verträge"
        icon={FileCheck}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Vertrags-Nr. oder Bezeichnung..."
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
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="gekündigt">Gekündigt</SelectItem>
            <SelectItem value="ausgelaufen">Ausgelaufen</SelectItem>
            <SelectItem value="entwurf">Entwurf</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {!isLoading && filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Keine Verträge gefunden"
          description={search || statusFilter !== 'all' 
            ? "Versuchen Sie andere Suchkriterien"
            : "Es sind noch keine Verträge vorhanden"
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredContracts}
          isLoading={isLoading}
          onRowClick={setSelectedContract}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl">
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
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <StatusBadge status={selectedContract.status} />
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Betrag</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedContract.monthly_amount)}</p>
                  <p className="text-xs text-slate-500">{billingCycleLabels[selectedContract.billing_cycle]}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Vertragsbeginn</p>
                  <p className="font-medium text-slate-700">
                    {selectedContract.start_date 
                      ? format(new Date(selectedContract.start_date), 'dd. MMMM yyyy', { locale: de })
                      : '-'
                    }
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Vertragsende</p>
                  <p className="font-medium text-slate-700">
                    {selectedContract.end_date 
                      ? format(new Date(selectedContract.end_date), 'dd. MMMM yyyy', { locale: de })
                      : 'Unbefristet'
                    }
                  </p>
                </div>
              </div>

              {/* Remaining time */}
              {selectedContract.status === 'aktiv' && selectedContract.end_date && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800">Verbleibende Laufzeit</p>
                      <p className="text-sm text-blue-600">
                        {differenceInDays(new Date(selectedContract.end_date), new Date())} Tage
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <RefreshCw className={`h-5 w-5 ${selectedContract.auto_renew ? 'text-emerald-500' : 'text-slate-400'}`} />
                <div>
                  <p className="font-medium text-slate-700">
                    {selectedContract.auto_renew ? 'Automatische Verlängerung aktiv' : 'Keine automatische Verlängerung'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedContract.auto_renew 
                      ? 'Der Vertrag verlängert sich automatisch zum Vertragsende'
                      : 'Der Vertrag endet zum angegebenen Datum'
                    }
                  </p>
                </div>
              </div>

              {selectedContract.file_url && (
                <Button asChild className="w-full">
                  <a href={selectedContract.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Vertrag herunterladen
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