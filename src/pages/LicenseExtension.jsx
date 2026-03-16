import React from 'react';
import { Calculator } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function LicenseExtension() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Vertragsanpassung / Lizenzerweiterung"
        subtitle="Berechnen Sie Kosten für zusätzliche Lizenzen zu bestehenden Verträgen"
        icon={Calculator}
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        <iframe
          src="https://mervisoft-partner-pricing-order-t-e2e1fb00.base44.app/"
          className="w-full h-full border-0"
          title="Vertragsanpassung Rechner"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}