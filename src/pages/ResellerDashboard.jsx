import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Plus, FileText, ShoppingCart, Search, Building2, TrendingUp, Euro, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import DataTable from '@/components/shared/DataTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResellerDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useTranslation();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const activeCustomers = customers.filter(c => c.status === 'aktiv').length;

  const getStatusLabel = (val) => {
    if (val === 'aktiv') return t('resellerDashboard.statusActive');
    if (val === 'inaktiv') return t('resellerDashboard.statusInactive');
    if (val === 'potentiell') return t('resellerDashboard.statusPotential');
    return t('resellerDashboard.statusActive');
  };

  const columns = [
    { key: 'customer_number', label: t('resellerDashboard.customerNumber'), render: (val) => <span className="font-mono text-slate-700">{val || '-'}</span> },
    { key: 'company_name', label: t('resellerDashboard.company'), render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'contact_person', label: t('resellerDashboard.contactPerson'), render: (val) => <span className="text-slate-600">{val || '-'}</span> },
    { key: 'email', label: 'E-Mail', render: (val) => <span className="text-slate-600">{val}</span> },
    { key: 'total_revenue', label: t('resellerDashboard.revenue'), render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span> },
    { key: 'status', label: t('common.status'), render: (val) => {
      const colors = { aktiv: 'bg-emerald-50 text-emerald-700', inaktiv: 'bg-slate-100 text-slate-600', potentiell: 'bg-blue-50 text-blue-700' };
      return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors[val || 'aktiv'] || colors.aktiv}`}>{getStatusLabel(val)}</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('resellerDashboard.title')}
        subtitle={t('resellerDashboard.subtitle')}
        icon={Building2}
        actions={
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
            <Link to={createPageUrl('NewCustomer')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('resellerDashboard.newCustomer')}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('resellerDashboard.totalCustomers')} value={customers.length} icon={Users} color="blue" />
        <StatCard title={t('resellerDashboard.activeCustomers')} value={activeCustomers} subtitle={t('resellerDashboard.inactive', { count: customers.length - activeCustomers })} icon={TrendingUp} color="green" />
        <StatCard title={t('resellerDashboard.totalRevenue')} value={formatCurrency(totalRevenue)} icon={Euro} color="purple" />
        <StatCard title={t('resellerDashboard.openQuotes')} value="12" subtitle={t('resellerDashboard.expiring', { count: 3 })} icon={FileText} color="orange" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('resellerDashboard.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('resellerDashboard.allStatus')}</SelectItem>
            <SelectItem value="aktiv">{t('resellerDashboard.statusActive')}</SelectItem>
            <SelectItem value="inaktiv">{t('resellerDashboard.statusInactive')}</SelectItem>
            <SelectItem value="potentiell">{t('resellerDashboard.statusPotential')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredCustomers} isLoading={isLoading} onRowClick={(customer) => { window.location.href = createPageUrl(`CustomerView?id=${customer.id}`); }} />
    </div>
  );
}