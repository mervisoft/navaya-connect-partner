import React from 'react';

const statusConfig = {
  // Quotes
  offen: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  angenommen: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  abgelehnt: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  abgelaufen: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  
  // Orders
  neu: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_bearbeitung: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  versendet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  abgeschlossen: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  storniert: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  
  // Invoices
  bezahlt: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  überfällig: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  
  // Deliveries
  in_vorbereitung: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  zugestellt: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  
  // Tickets
  wartend: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  geschlossen: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  
  // Contracts
  aktiv: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  gekündigt: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  ausgelaufen: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  entwurf: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  
  // Projects
  geplant: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  pausiert: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const statusLabels = {
  in_bearbeitung: 'In Bearbeitung',
  in_vorbereitung: 'In Vorbereitung',
  überfällig: 'Überfällig',
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.offen;
  const label = statusLabels[status] || status?.charAt(0).toUpperCase() + status?.slice(1);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}