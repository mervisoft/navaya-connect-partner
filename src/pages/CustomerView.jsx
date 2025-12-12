import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Building2, FileText, ShoppingCart, Receipt, User } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CustomerView() {
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCustomerId(params.get('id'));
  }, []);

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => base44.entities.Customer.list(),
    select: (data) => data.find(c => c.id === customerId),
    enabled: !!customerId,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 5),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 5),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 5),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  if (!customer) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Reseller Mode Banner */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <User className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            Sie befinden sich im Dashboard von <strong>{customer.company_name}</strong>
          </span>
          <Button asChild variant="outline" size="sm">
            <Link to={createPageUrl('ResellerDashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      <PageHeader
        title={customer.company_name}
        subtitle={`Kundenübersicht • ${customer.contact_person || 'Kein Ansprechpartner'}`}
        icon={Building2}
      />

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Kontaktdaten</h3>
          <div className="space-y-2 text-sm">
            <p><strong>E-Mail:</strong> {customer.email}</p>
            {customer.phone && <p><strong>Telefon:</strong> {customer.phone}</p>}
            {customer.address && (
              <p>
                <strong>Adresse:</strong><br />
                {customer.address}<br />
                {customer.postal_code} {customer.city}
              </p>
            )}
          </div>
        </div>

        <StatCard
          title="Gesamtumsatz"
          value={formatCurrency(customer.total_revenue)}
          icon={Receipt}
          color="green"
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Notizen</h3>
          <p className="text-sm text-slate-600">
            {customer.notes || 'Keine Notizen vorhanden'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Angebote"
          value={quotes.length}
          subtitle="Letzte 5 Angebote"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Aufträge"
          value={orders.length}
          subtitle="Letzte 5 Aufträge"
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Rechnungen"
          value={invoices.length}
          subtitle="Letzte 5 Rechnungen"
          icon={Receipt}
          color="orange"
        />
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button asChild size="lg" className="h-auto py-6 bg-emerald-600 hover:bg-emerald-700">
          <Link to={createPageUrl(`Shop?customerId=${customerId}`)}>
            <ShoppingCart className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Shop für diesen Kunden</div>
              <div className="text-xs opacity-90">Produkte und Lizenzen bestellen</div>
            </div>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-6 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Link to={createPageUrl(`RequestQuote?customerId=${customerId}`)}>
            <FileText className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Angebot anfragen</div>
              <div className="text-xs opacity-90">Individuelles Angebot erstellen</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
          <Link to={createPageUrl('Quotes')}>
            <FileText className="h-6 w-6" />
            <span>Angebote</span>
          </Link>
        </Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
          <Link to={createPageUrl('Orders')}>
            <ShoppingCart className="h-6 w-6" />
            <span>Aufträge</span>
          </Link>
        </Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
          <Link to={createPageUrl('Invoices')}>
            <Receipt className="h-6 w-6" />
            <span>Rechnungen</span>
          </Link>
        </Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
          <Link to={createPageUrl('Tickets')}>
            <FileText className="h-6 w-6" />
            <span>Tickets</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}