import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Building2, FileText, ShoppingCart, Receipt, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import ActivityTimeline from '@/components/customer/ActivityTimeline';
import ActivityDetailDialog from '@/components/customer/ActivityDetailDialog';
import SalesChart from '@/components/customer/SalesChart';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function CustomerView() {
  const [customerId, setCustomerId] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCustomerId = params.get('id');
    const storedCustomerId = localStorage.getItem('activeCustomerId');
    const id = urlCustomerId || storedCustomerId;
    if (id) {
      setCustomerId(id);
      if (urlCustomerId) localStorage.setItem('activeCustomerId', urlCustomerId);
    }
  }, []);

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({ queryKey: ['customers'], queryFn: () => base44.entities.Customer.list(), enabled: !!customerId });
  const customer = customers.find(c => c.id === customerId);

  const { data: quotes = [] } = useQuery({ queryKey: ['quotes'], queryFn: () => base44.entities.Quote.list('-created_date', 5), enabled: !!customerId });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => base44.entities.Order.list('-created_date', 5), enabled: !!customerId });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date'), enabled: !!customerId });
  const { data: allOrders = [] } = useQuery({ queryKey: ['allOrders'], queryFn: () => base44.entities.Order.list('-created_date'), enabled: !!customerId });
  const { data: tickets = [] } = useQuery({ queryKey: ['tickets'], queryFn: () => base44.entities.Ticket.list('-created_date', 10), enabled: !!customerId });
  const { data: contracts = [] } = useQuery({ queryKey: ['contracts'], queryFn: () => base44.entities.Contract.list('-created_date', 10), enabled: !!customerId });

  const allActivities = React.useMemo(() => {
    const activities = [];
    quotes.forEach(q => activities.push({ type: 'quote', date: q.created_date, data: q }));
    orders.forEach(o => activities.push({ type: 'order', date: o.created_date, data: o }));
    invoices.forEach(i => activities.push({ type: 'invoice', date: i.created_date, data: i }));
    tickets.forEach(t => activities.push({ type: 'ticket', date: t.created_date, data: t }));
    contracts.forEach(c => activities.push({ type: 'contract', date: c.created_date, data: c }));
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [quotes, orders, invoices, tickets, contracts]);

  const handleViewDetails = (activity) => { setSelectedActivity(activity); setDialogOpen(true); };

  const formatCurrency = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

  const salesData = React.useMemo(() => {
    const monthlyData = {};
    const categoryData = {};
    [...invoices, ...allOrders].forEach(item => {
      if (!item.created_date || !item.amount) return;
      const date = new Date(item.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { label: monthLabel, invoices: 0, orders: 0 };
      if (item.invoice_number) monthlyData[monthKey].invoices += item.amount;
      else if (item.order_number) monthlyData[monthKey].orders += item.amount;
    });
    allOrders.forEach(order => {
      const status = order.status || 'unbekannt';
      categoryData[status] = (categoryData[status] || 0) + (order.amount || 0);
    });
    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6);
    return {
      monthly: {
        labels: last6Months.map(key => monthlyData[key].label),
        datasets: [
          { label: t('customerView.totalInvoices'), data: last6Months.map(key => monthlyData[key].invoices) },
          { label: t('customerView.totalOrders'), data: last6Months.map(key => monthlyData[key].orders) }
        ]
      },
      byStatus: {
        labels: Object.keys(categoryData).map(status => {
          const labels = { neu: t('orders.statusNew'), in_bearbeitung: t('orders.statusProcessing'), versendet: t('orders.statusShipped'), abgeschlossen: t('orders.statusDone'), storniert: t('orders.statusCancelled') };
          return labels[status] || status;
        }),
        datasets: [{ label: t('customerView.byStatus'), data: Object.values(categoryData) }]
      }
    };
  }, [invoices, allOrders, t]);

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">{t('customerView.noCustomerTitle')}</h3>
        <p className="text-slate-500 text-center max-w-sm mb-4">{t('customerView.noCustomerDesc')}</p>
        <Button asChild><Link to={createPageUrl('Customers')}>{t('customerView.toCustomerList')}</Link></Button>
      </div>
    );
  }

  if (loadingCustomers || !customer) {
    return <div className="p-8 text-center text-slate-600">{t('customerView.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Building2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">{t('customerView.banner')} <strong>{customer.company_name}</strong></span>
          <Button asChild variant="outline" size="sm">
            <Link to={createPageUrl('Customers')}><ArrowLeft className="h-4 w-4 mr-2" />{t('customerView.backToCustomers')}</Link>
          </Button>
        </AlertDescription>
      </Alert>

      <PageHeader title={customer.company_name} subtitle={`${t('customerView.banner').replace(':', '')} • ${customer.contact_person || '-'}`} icon={Building2} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">{t('customerView.contactData')}</h3>
          <div className="space-y-2 text-sm">
            <p><strong>E-Mail:</strong> {customer.email}</p>
            {customer.phone && <p><strong>Tel.:</strong> {customer.phone}</p>}
            {customer.address && <p><strong>{t('common.back').replace('Zurück', 'Adresse')}:</strong><br />{customer.address}<br />{customer.postal_code} {customer.city}</p>}
          </div>
        </div>
        <StatCard title={t('customerView.totalRevenue')} value={formatCurrency(customer.total_revenue)} icon={Receipt} color="green" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">{t('customerView.notes')}</h3>
          <p className="text-sm text-slate-600">{customer.notes || t('customerView.noNotes')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('customerView.totalQuotes')} value={quotes.length} subtitle={t('customerView.total')} icon={FileText} color="blue" />
        <StatCard title={t('customerView.totalOrders')} value={allOrders.length} subtitle={t('customerView.total')} icon={ShoppingCart} color="purple" />
        <StatCard title={t('customerView.totalInvoices')} value={invoices.length} subtitle={t('customerView.total')} icon={Receipt} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">{t('customerView.revenueChart')}</h3><p className="text-sm text-slate-500">{t('customerView.last6Months')}</p></div>
          </div>
          <div className="h-80"><SalesChart data={salesData.monthly} type="line" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center"><PieChart className="h-5 w-5 text-white" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">{t('customerView.byStatus')}</h3><p className="text-sm text-slate-500">{t('customerView.orderDistribution')}</p></div>
          </div>
          <div className="h-80"><SalesChart data={salesData.byStatus} type="doughnut" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-white" /></div>
          <div><h3 className="text-lg font-bold text-slate-800">{t('customerView.comparison')}</h3><p className="text-sm text-slate-500">{t('customerView.monthlyComparison')}</p></div>
        </div>
        <div className="h-80"><SalesChart data={salesData.monthly} type="bar" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button asChild size="lg" className="h-auto py-6 bg-emerald-600 hover:bg-emerald-700">
          <Link to={createPageUrl(`Shop?customerId=${customerId}`)}>
            <ShoppingCart className="h-6 w-6 mr-3" />
            <div className="text-left"><div className="font-semibold">{t('customerView.shopForCustomer')}</div><div className="text-xs opacity-90">{t('customerView.shopDesc')}</div></div>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-6 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Link to={createPageUrl(`RequestQuote?customerId=${customerId}`)}>
            <FileText className="h-6 w-6 mr-3" />
            <div className="text-left"><div className="font-semibold">{t('customerView.requestQuote')}</div><div className="text-xs opacity-90">{t('customerView.requestQuoteDesc')}</div></div>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline"><Link to={createPageUrl('Quotes')}><FileText className="h-6 w-6" /><span>{t('nav.quotes')}</span></Link></Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline"><Link to={createPageUrl('Orders')}><ShoppingCart className="h-6 w-6" /><span>{t('nav.orders')}</span></Link></Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline"><Link to={createPageUrl('Invoices')}><Receipt className="h-6 w-6" /><span>{t('nav.invoices')}</span></Link></Button>
        <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline"><Link to={createPageUrl('Tickets')}><FileText className="h-6 w-6" /><span>{t('nav.tickets')}</span></Link></Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center"><Clock className="h-5 w-5 text-sky-300" /></div>
            <div><h2 className="text-xl font-bold text-slate-800">{t('customerView.activityHistory')}</h2><p className="text-sm text-slate-500">{t('customerView.activityDesc')}</p></div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-slate-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all">{t('customerView.tabAll')} ({allActivities.length})</TabsTrigger>
              <TabsTrigger value="quotes">{t('customerView.tabQuotes')} ({quotes.length})</TabsTrigger>
              <TabsTrigger value="orders">{t('customerView.tabOrders')} ({orders.length})</TabsTrigger>
              <TabsTrigger value="invoices">{t('customerView.tabInvoices')} ({invoices.length})</TabsTrigger>
              <TabsTrigger value="tickets">{t('customerView.tabTickets')} ({tickets.length})</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6">
            <TabsContent value="all"><ActivityTimeline activities={allActivities} onViewDetails={handleViewDetails} /></TabsContent>
            <TabsContent value="quotes"><ActivityTimeline activities={allActivities.filter(a => a.type === 'quote')} onViewDetails={handleViewDetails} /></TabsContent>
            <TabsContent value="orders"><ActivityTimeline activities={allActivities.filter(a => a.type === 'order')} onViewDetails={handleViewDetails} /></TabsContent>
            <TabsContent value="invoices"><ActivityTimeline activities={allActivities.filter(a => a.type === 'invoice')} onViewDetails={handleViewDetails} /></TabsContent>
            <TabsContent value="tickets"><ActivityTimeline activities={allActivities.filter(a => a.type === 'ticket')} onViewDetails={handleViewDetails} /></TabsContent>
          </div>
        </Tabs>
      </div>

      <ActivityDetailDialog activity={selectedActivity} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}