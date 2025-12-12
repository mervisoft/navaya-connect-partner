import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Kontakt zu Mervisoft"
        subtitle="Wir sind für Sie da"
        icon={Mail}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">E-Mail</h3>
                <p className="text-slate-600">info@mervisoft.de</p>
                <p className="text-slate-600">support@mervisoft.de</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Telefon</h3>
                <p className="text-slate-600">+49 (0) 123 456789</p>
                <p className="text-sm text-slate-500">Mo-Fr: 9:00 - 17:00 Uhr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Adresse</h3>
                <p className="text-slate-600">
                  Mervisoft GmbH<br />
                  Musterstraße 123<br />
                  12345 Musterstadt
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Website</h3>
                <p className="text-slate-600">www.mervisoft.de</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Öffnungszeiten</h3>
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Montag - Freitag:</span>
              <span className="font-medium">9:00 - 17:00 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span>Samstag - Sonntag:</span>
              <span className="font-medium">Geschlossen</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}