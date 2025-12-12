import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShoppingCart, Receipt, TicketCheck, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from "@/components/ui/button";

const activityIcons = {
  quote: FileText,
  order: ShoppingCart,
  invoice: Receipt,
  ticket: TicketCheck,
  contract: FileCheck,
};

const activityColors = {
  quote: 'bg-blue-100 text-blue-600',
  order: 'bg-purple-100 text-purple-600',
  invoice: 'bg-orange-100 text-orange-600',
  ticket: 'bg-pink-100 text-pink-600',
  contract: 'bg-emerald-100 text-emerald-600',
};

export default function ActivityTimeline({ activities, onViewDetails }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const getActivityTitle = (activity) => {
    switch(activity.type) {
      case 'quote':
        return activity.data.title || `Angebot ${activity.data.quote_number}`;
      case 'order':
        return activity.data.title || `Auftrag ${activity.data.order_number}`;
      case 'invoice':
        return activity.data.title || `Rechnung ${activity.data.invoice_number}`;
      case 'ticket':
        return activity.data.subject;
      case 'contract':
        return activity.data.title || `Vertrag ${activity.data.contract_number}`;
      default:
        return 'Unbekannte Aktivität';
    }
  };

  const getActivityDescription = (activity) => {
    switch(activity.type) {
      case 'quote':
        return `Angebotssumme: ${formatCurrency(activity.data.amount)}`;
      case 'order':
        return `Auftragswert: ${formatCurrency(activity.data.amount)}`;
      case 'invoice':
        return `Rechnungsbetrag: ${formatCurrency(activity.data.amount)}`;
      case 'ticket':
        return activity.data.description?.substring(0, 80) + '...';
      case 'contract':
        return `${formatCurrency(activity.data.monthly_amount || 0)}/Monat`;
      default:
        return '';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Noch keine Aktivitäten vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];

        return (
          <motion.div
            key={`${activity.type}-${activity.data.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-8"
          >
            {/* Timeline Line */}
            {index < activities.length - 1 && (
              <div className="absolute left-3 top-10 w-0.5 h-full bg-slate-200" />
            )}

            {/* Timeline Dot */}
            <div className={`absolute left-0 top-2 w-6 h-6 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}>
              <Icon className="h-3 w-3" />
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-800 truncate">
                      {getActivityTitle(activity)}
                    </h4>
                    <StatusBadge status={activity.data.status} />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(activity.date), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(activity)}
                >
                  Details
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}