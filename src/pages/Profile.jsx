import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Save, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    phone: '',
    address: '',
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      setFormData({
        full_name: userData?.full_name || '',
        company: userData?.company || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
      });
      return userData;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success("Profil erfolgreich aktualisiert. Änderungen werden an weclapp übermittelt.");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Profils.");
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const hasChanges = user && (
    formData.full_name !== (user.full_name || '') ||
    formData.company !== (user.company || '') ||
    formData.phone !== (user.phone || '') ||
    formData.address !== (user.address || '')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mein Profil"
        subtitle="Ihre persönlichen Informationen verwalten"
        icon={User}
      />

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm max-w-2xl mx-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Alle Änderungen werden automatisch mit Ihrem weclapp-Kundendatensatz synchronisiert.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="mt-1 bg-slate-50" 
                />
                <p className="text-xs text-slate-500 mt-1">Diese E-Mail-Adresse kann nicht geändert werden.</p>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="fullName">Vollständiger Name *</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-1"
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <Label htmlFor="company">Firma</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="mt-1"
                  placeholder="Mustermann GmbH"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="Musterstraße 123, 12345 Musterstadt"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || !hasChanges || !formData.full_name.trim()}
                className="w-full md:w-auto bg-[#1e3a5f] hover:bg-[#2d4a6f]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Änderungen speichern
                  </>
                )}
              </Button>
              {!hasChanges && !updateProfileMutation.isPending && (
                <p className="text-sm text-slate-500 mt-2">Keine Änderungen vorgenommen</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}