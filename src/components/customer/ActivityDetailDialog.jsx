import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ShoppingCart, Receipt, TicketCheck, FileCheck, Download, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ActivityDetailDialog({ activity, open, onOpenChange }) {
  if (!activity) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd. MMMM yyyy', { locale: de });
  };

  const renderQuoteDetails = (data) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Angebotsnummer</p>
          <p className="font-semibold">{data.quote_number}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Betrag</p>
          <p className="font-semibold text-lg">{formatCurrency(data.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Gültig bis</p>
          <p className="font-semibold">{formatDate(data.valid_until)}</p>
        </div>
      </div>

      {data.items && data.items.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Positionen</h4>
          <div className="space-y-2">
            {data.items.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity}x à {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.notes && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Notizen</h4>
          <p className="text-slate-600 text-sm">{data.notes}</p>
        </div>
      )}

      {data.file_url && (
        <Button asChild className="w-full">
          <a href={data.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Angebot herunterladen
          </a>
        </Button>
      )}
    </div>
  );

  const renderOrderDetails = (data) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Auftragsnummer</p>
          <p className="font-semibold">{data.order_number}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Betrag</p>
          <p className="font-semibold text-lg">{formatCurrency(data.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Bestelldatum</p>
          <p className="font-semibold">{formatDate(data.order_date)}</p>
        </div>
      </div>

      {data.items && data.items.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Positionen</h4>
          <div className="space-y-2">
            {data.items.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity}x à {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.file_url && (
        <Button asChild className="w-full">
          <a href={data.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Auftragsbestätigung herunterladen
          </a>
        </Button>
      )}
    </div>
  );

  const renderInvoiceDetails = (data) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Rechnungsnummer</p>
          <p className="font-semibold">{data.invoice_number}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Betrag</p>
          <p className="font-semibold text-lg">{formatCurrency(data.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Fällig am</p>
          <p className="font-semibold">{formatDate(data.due_date)}</p>
        </div>
      </div>

      {data.file_url && (
        <Button asChild className="w-full">
          <a href={data.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Rechnung herunterladen
          </a>
        </Button>
      )}
    </div>
  );

  const renderTicketDetails = (data) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Ticket-Nummer</p>
          <p className="font-semibold">{data.ticket_number}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Priorität</p>
          <StatusBadge status={data.priority} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Kategorie</p>
          <p className="font-semibold capitalize">{data.category}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-800 mb-2">Beschreibung</h4>
        <p className="text-slate-600 text-sm">{data.description}</p>
      </div>

      {data.comments && data.comments.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">
            Kommentare ({data.comments.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {data.comments.slice(-3).map((comment, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-700">{comment.author}</p>
                <p className="text-sm text-slate-600 mt-1">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContractDetails = (data) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Vertragsnummer</p>
          <p className="font-semibold">{data.contract_number}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <StatusBadge status={data.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Monatlicher Betrag</p>
          <p className="font-semibold text-lg">{formatCurrency(data.monthly_amount)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Abrechnungszyklus</p>
          <p className="font-semibold capitalize">{data.billing_cycle}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Startdatum</p>
          <p className="font-semibold">{formatDate(data.start_date)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Enddatum</p>
          <p className="font-semibold">{formatDate(data.end_date)}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-sm text-slate-600">
          Automatische Verlängerung: {data.auto_renew ? 'Ja' : 'Nein'}
        </p>
      </div>

      {data.file_url && (
        <Button asChild className="w-full">
          <a href={data.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Vertrag herunterladen
          </a>
        </Button>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activity.type) {
      case 'quote':
        return renderQuoteDetails(activity.data);
      case 'order':
        return renderOrderDetails(activity.data);
      case 'invoice':
        return renderInvoiceDetails(activity.data);
      case 'ticket':
        return renderTicketDetails(activity.data);
      case 'contract':
        return renderContractDetails(activity.data);
      default:
        return <p>Keine Details verfügbar</p>;
    }
  };

  const getIcon = () => {
    const icons = {
      quote: FileText,
      order: ShoppingCart,
      invoice: Receipt,
      ticket: TicketCheck,
      contract: FileCheck,
    };
    return icons[activity.type] || FileText;
  };

  const Icon = getIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Icon className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-bold">{activity.data.title || activity.data.subject}</div>
              <div className="text-sm text-slate-500 font-normal">
                {format(new Date(activity.date), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}