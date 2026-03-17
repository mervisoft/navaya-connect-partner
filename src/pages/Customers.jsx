import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Search, Building2, Mail, Phone, MapPin, LayoutGrid, Table, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from '@/components/shared/DataTable';
import { useWeclappParty } from '@/hooks/useWeclappParty';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { t } = useTranslation();
  const { partyId, isLoading: partyLoading, error: partyError, isAdmin } = useWeclappParty();

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['weclapp-customers', partyId, isAdmin],
    enabled: !partyLoading && (!!partyId || isAdmin),
    queryFn: async () => {
      const response = await base44.functions.invoke('weclappProxy', {
        mode: 'customers',
        ...(partyId ? { partyId } : {}),
      });
      return response.data?.customers || [];
    },
  });

  const customers = customersData || [];
  const isLoading = partyLoading || customersLoading;

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.customerNumber?.toLowerCase().includes(q)
    );
  });

  const tableColumns = [
    { label: t('customers.company'), render: (c) => <div><div className="font-semibold text-slate-800">{c.company || '-'}</div>{c.customerNumber && <div className="text-xs text-slate-500 font-mono">{c.customerNumber}</div>}</div> },
    { label: t('customers.contact'), render: (c) => c.contacts?.[0] ? `${c.contacts[0].firstName || ''} ${c.contacts[0].lastName || ''}`.trim() : '-' },
    { label: t('customers.contactInfo'), render: (c) => <div className="space-y-1">{c.email && <div className="text-sm flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /><span className="truncate max-w-[200px]">{c.email}</span></div>}{c.phone && <div className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /><span>{c.phone}</span></div>}</div> },
    { label: t('customers.city'), render: (c) => c.city || '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        icon={Users}
      />

      {partyError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{partyError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t('customers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-[#1e3a5f] hover:bg-[#2d4a6f]' : ''}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-[#1e3a5f] hover:bg-[#2d4a6f]' : ''}>
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : <div className="bg-white rounded-2xl border border-slate-200"><DataTable columns={tableColumns} data={[]} isLoading={true} /></div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState icon={Users} title={t('customers.noFound')} description={t('customers.noFoundDesc')} />
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <DataTable
            columns={tableColumns}
            data={filteredCustomers}
            onRowClick={(c) => window.location.href = createPageUrl(`CustomerView?weclappId=${c.id}`)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div key={customer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Link to={createPageUrl(`CustomerView?weclappId=${customer.id}`)}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg shadow-slate-300/30">
                      <Building2 className="h-6 w-6 text-sky-300" />
                    </div>
                    {customer.customerNumber && (
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {customer.customerNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#1e3a5f] transition-colors">
                    {customer.company}
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 mt-3">
                    {customer.contacts?.[0] && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{`${customer.contacts[0].firstName || ''} ${customer.contacts[0].lastName || ''}`.trim()}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{customer.zipcode} {customer.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}