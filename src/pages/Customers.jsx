import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Plus, 
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  LayoutGrid,
  Table
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DataTable from '@/components/shared/DataTable';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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

  const filteredCustomers = customers
    .filter(customer => customer && customer.id)
    .filter(customer => {
      const matchesSearch = 
        customer.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));

  const getStatusColor = (status) => {
    const colors = {
      aktiv: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inaktiv: 'bg-slate-100 text-slate-600 border-slate-300',
      potentiell: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || colors.aktiv;
  };

  const getStatusLabel = (status) => {
    if (!status || typeof status !== 'string') return 'Aktiv';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const tableColumns = [
    {
      label: 'Firma',
      render: (customer) => {
        if (!customer) return '-';
        return (
          <div>
            <div className="font-semibold text-slate-800">{customer.company_name || '-'}</div>
            {customer.customer_number && (
              <div className="text-xs text-slate-500 font-mono">{customer.customer_number}</div>
            )}
          </div>
        );
      }
    },
    {
      label: 'Ansprechpartner',
      render: (customer) => {
        if (!customer) return '-';
        return customer.contact_person || '-';
      }
    },
    {
      label: 'Kontakt',
      render: (customer) => {
        if (!customer) return '-';
        return (
          <div className="space-y-1">
            {customer.email && (
              <div className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                <span className="truncate max-w-[200px]">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      label: 'Ort',
      render: (customer) => {
        if (!customer) return '-';
        return customer.city || '-';
      }
    },
    {
      label: 'Umsatz',
      render: (customer) => {
        if (!customer) return '-';
        return (
          <span className="font-semibold text-slate-800">
            {formatCurrency(customer.total_revenue)}
          </span>
        );
      }
    },
    {
      label: 'Status',
      render: (customer) => {
        if (!customer) return '-';
        return (
          <Badge variant="outline" className={getStatusColor(customer.status)}>
            {getStatusLabel(customer.status)}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kundenverwaltung"
        subtitle="Verwalten Sie Ihre Kunden"
        icon={Users}
        actions={
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
            <Link to={createPageUrl('NewCustomer')}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kunde
            </Link>
          </Button>
        }
      />

      {/* Filters and View Toggle */}
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
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-[#1e3a5f] hover:bg-[#2d4a6f]' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-[#1e3a5f] hover:bg-[#2d4a6f]' : ''}
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer Display */}
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
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200">
            <DataTable columns={tableColumns} data={[]} isLoading={true} />
          </div>
        )
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Keine Kunden gefunden"
          description="Erstellen Sie Ihren ersten Kunden oder passen Sie Ihre Suchkriterien an"
        />
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <DataTable 
            columns={tableColumns} 
            data={filteredCustomers}
            onRowClick={(customer) => window.location.href = createPageUrl(`CustomerView?id=${customer.id}`)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`CustomerView?id=${customer.id}`)}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg shadow-slate-300/30">
                      <Building2 className="h-6 w-6 text-sky-300" />
                    </div>
                    <Badge variant="outline" className={getStatusColor(customer?.status)}>
                     {getStatusLabel(customer?.status)}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#1e3a5f] transition-colors">
                    {customer.company_name}
                  </h3>
                  
                  {customer.customer_number && (
                    <p className="text-xs text-slate-500 mb-3 font-mono">
                      {customer.customer_number}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600">
                    {customer.contact_person && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{customer.contact_person}</span>
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
                        <span>{customer.city}</span>
                      </div>
                    )}
                  </div>

                  {customer.total_revenue > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Gesamtumsatz</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(customer.total_revenue)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}