import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Plus, 
  FileText, 
  ShoppingCart, 
  Search,
  Building2,
  TrendingUp,
  Euro,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
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

export default function ResellerDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
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

  const columns = [
    {
      key: 'customer_number',
      label: 'Kunden-Nr.',
      render: (val) => <span className="font-mono text-slate-700">{val || '-'}</span>
    },
    {
      key: 'company_name',
      label: 'Firma',
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'contact_person',
      label: 'Ansprechpartner',
      render: (val) => <span className="text-slate-600">{val || '-'}</span>
    },
    {
      key: 'email',
      label: 'E-Mail',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      key: 'total_revenue',
      label: 'Umsatz',
      render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const colors = {
          aktiv: 'bg-emerald-50 text-emerald-700',
          inaktiv: 'bg-slate-100 text-slate-600',
          potentiell: 'bg-blue-50 text-blue-700'
        };
        const labels = {
          aktiv: 'Aktiv',
          inaktiv: 'Inaktiv',
          potentiell: 'Potentiell'
        };
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colors[val || 'aktiv'] || colors.aktiv}`}>
            {labels[val] || 'Aktiv'}
          </span>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reseller Dashboard"
        subtitle="Verwalten Sie Ihre Kunden und Bestellungen"
        icon={Building2}
        actions={
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
            <Link to={createPageUrl('NewCustomer')}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kunde
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Kunden Gesamt"
          value={customers.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Aktive Kunden"
          value={activeCustomers}
          subtitle={`${customers.length - activeCustomers} inaktiv`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Gesamtumsatz"
          value={formatCurrency(totalRevenue)}
          icon={Euro}
          color="purple"
        />
        <StatCard
          title="Offene Angebote"
          value="12"
          subtitle="3 ablaufend"
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Suche nach Firma, Ansprechpartner oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="inaktiv">Inaktiv</SelectItem>
            <SelectItem value="potentiell">Potentiell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        isLoading={isLoading}
        onRowClick={(customer) => {
          window.location.href = createPageUrl(`CustomerView?id=${customer.id}`);
        }}
      />
    </div>
  );
}