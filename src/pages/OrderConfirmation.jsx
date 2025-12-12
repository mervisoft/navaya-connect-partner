import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, Mail, FileText, FileCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderConfirmation() {
  const customerId = localStorage.getItem('activeCustomerId');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bestellung erfolgreich übermittelt!</h1>
        <p className="text-lg text-slate-600">Ihre Bestellung wird nun von unserem Team bearbeitet.</p>
      </motion.div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Per E-Mail informiert</h3>
              <p className="text-slate-600">
                Sie erhalten eine Bestätigungs-E-Mail mit allen Details zu Ihrer Bestellung. 
                Rechnung und Lizenzinformationen werden Ihnen ebenfalls per E-Mail zugesendet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Rechnung verfügbar</h3>
              <p className="text-slate-600">
                Sobald die Bestellung bearbeitet wurde, finden Sie die Rechnung im Bereich{' '}
                <strong>"Rechnungen"</strong> in Ihrem Kundenportal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <FileCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Vertragsinformationen</h3>
              <p className="text-slate-600">
                Laufzeiten und Status des Vertrages zu Ihren Lizenzen können Sie unter{' '}
                <strong>"Verträge"</strong> einsehen, sobald die Bestellung durch Mervisoft abgeschlossen wurde.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-2">Nächste Schritte</h3>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">1</span>
            <span>Unser Team prüft Ihre Bestellung und bereitet die Lizenzen vor</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">2</span>
            <span>Sie erhalten eine Rechnung per E-Mail und im Portal</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">3</span>
            <span>Nach Zahlungseingang werden die Lizenzen aktiviert</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">4</span>
            <span>Sie können den Vertragsstatus unter "Verträge" einsehen</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link to={createPageUrl(customerId ? `CustomerView?id=${customerId}` : 'ResellerDashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Link>
        </Button>
        <Button asChild className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Link to={createPageUrl(`Shop${customerId ? `?customerId=${customerId}` : ''}`)}>
            Weiter einkaufen
          </Link>
        </Button>
      </div>
    </div>
  );
}