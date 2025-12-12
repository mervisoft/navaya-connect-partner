import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  TicketCheck,
  FileCheck,
  ArrowRight,
  Clock
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
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

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date', 5),
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.filter({ status: 'aktiv' }),
  });

  const openInvoices = invoices.filter(i => i.status === 'offen' || i.status === 'überfällig');
  const openTickets = tickets.filter(t => t.status !== 'geschlossen');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const QuickLinkCard = ({ title, description, icon: Icon, href, color }) => (
    <Link to={href}>
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-3">{description}</p>
        <div className="flex items-center gap-1 text-sm font-medium text-sky-600 group-hover:text-sky-700">
          Ansehen <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );

  const RecentItemRow = ({ number, title, date, status, amount }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{number || title}</p>
          {date && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {format(new Date(date), 'dd. MMM yyyy', { locale: de })}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {amount !== undefined && (
          <span className="font-semibold text-slate-700">{formatCurrency(amount)}</span>
        )}
        {status && <StatusBadge status={status} />}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg shadow-slate-300/30">
            <LayoutDashboard className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500">Übersicht Ihrer Geschäftsdaten</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Offene Angebote"
          value={quotes.filter(q => q.status === 'offen').length}
          subtitle="Ausstehende Entscheidungen"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Aktive Aufträge"
          value={orders.filter(o => o.status !== 'abgeschlossen' && o.status !== 'storniert').length}
          subtitle="In Bearbeitung"
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Offene Rechnungen"
          value={formatCurrency(openInvoices.reduce((sum, i) => sum + (i.amount || 0), 0))}
          subtitle={`${openInvoices.length} Rechnungen`}
          icon={Receipt}
          color="orange"
        />
        <StatCard
          title="Support Tickets"
          value={openTickets.length}
          subtitle="Offene Anfragen"
          icon={TicketCheck}
          color="rose"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLinkCard
            title="Neues Ticket"
            description="Support-Anfrage erstellen"
            icon={TicketCheck}
            href={createPageUrl('Tickets')}
            color="from-rose-500 to-rose-600"
          />
          <QuickLinkCard
            title="Verträge"
            description={`${contracts.length} aktive Verträge`}
            icon={FileCheck}
            href={createPageUrl('Contracts')}
            color="from-emerald-500 to-emerald-600"
          />
          <QuickLinkCard
            title="Rechnungen"
            description="Alle Rechnungen einsehen"
            icon={Receipt}
            href={createPageUrl('Invoices')}
            color="from-amber-500 to-amber-600"
          />
          <QuickLinkCard
            title="Aufträge"
            description="Bestellungen verfolgen"
            icon={ShoppingCart}
            href={createPageUrl('Orders')}
            color="from-violet-500 to-violet-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Neueste Angebote</h3>
            <Link to={createPageUrl('Quotes')} className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              Alle ansehen
            </Link>
          </div>
          <div className="px-5 py-2">
            {quotes.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">Keine Angebote vorhanden</p>
            ) : (
              quotes.slice(0, 4).map(quote => (
                <RecentItemRow
                  key={quote.id}
                  number={quote.quote_number}
                  title={quote.title}
                  date={quote.created_date}
                  status={quote.status}
                  amount={quote.amount}
                />
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Neueste Rechnungen</h3>
            <Link to={createPageUrl('Invoices')} className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              Alle ansehen
            </Link>
          </div>
          <div className="px-5 py-2">
            {invoices.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">Keine Rechnungen vorhanden</p>
            ) : (
              invoices.slice(0, 4).map(invoice => (
                <RecentItemRow
                  key={invoice.id}
                  number={invoice.invoice_number}
                  title={invoice.title}
                  date={invoice.invoice_date || invoice.created_date}
                  status={invoice.status}
                  amount={invoice.amount}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}