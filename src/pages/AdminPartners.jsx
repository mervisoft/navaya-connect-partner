import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Users, Shield, Mail, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState as useStateHook } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function AdminPartners() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('Not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        return await base44.asServiceRole.entities.User.list();
      } catch (e) {
        console.error('Error loading users:', e);
        return [];
      }
    },
  });

  // Check if current user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen p-8">
        <Alert className="bg-red-50 border-red-200">
          <Shield className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Du hast keinen Zugriff auf diese Seite. Nur Administratoren können Partner verwalten.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter partners based on search and role
  const filteredPartners = allUsers.filter((partner) => {
    const matchesSearch =
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || partner.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Partner-Verwaltung"
        subtitle="Verwalte deine Partner und ihre Berechtigungen"
        icon={Users}
      />

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            Fehler beim Laden der Partner. Bitte versuche es später erneut.
          </AlertDescription>
        </Alert>
      )}

      {/* Filter und Suchbereich */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Suchen
            </label>
            <Input
              type="text"
              placeholder="E-Mail oder Name eingeben..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Rolle filtern
            </label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alle Rollen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Partner-Liste */}
      <div className="space-y-3">
        {filteredPartners.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Keine Partner gefunden</p>
          </div>
        ) : (
          filteredPartners.map((partner, idx) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {partner.full_name || 'Unbenannter Partner'}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        partner.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {partner.role === 'admin' ? 'Admin' : 'Partner'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {partner.email}
                    </div>
                    {partner.updated_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(partner.updated_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                  {partner.weclapp_party_id && (
                    <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                      Weclapp Party ID: <strong>{partner.weclapp_party_id}</strong>
                    </div>
                  )}
                </div>

                <Dialog open={isDialogOpen && selectedPartner?.id === partner.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setSelectedPartner(null);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{partner.full_name || partner.email}</DialogTitle>
                      <DialogDescription>
                        Partner-Informationen und Berechtigungen
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          E-Mail
                        </label>
                        <p className="text-slate-600 mt-1">{partner.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Rolle
                        </label>
                        <p className="text-slate-600 mt-1 capitalize">{partner.role}</p>
                      </div>
                      {partner.weclapp_party_id && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Weclapp Party ID
                          </label>
                          <p className="text-slate-600 mt-1">{partner.weclapp_party_id}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Registriert am
                        </label>
                        <p className="text-slate-600 mt-1">
                          {new Date(partner.created_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 p-6">
          <div className="text-2xl font-bold text-blue-900">{filteredPartners.length}</div>
          <div className="text-sm text-blue-700 mt-1">Partner gesamt</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 p-6">
          <div className="text-2xl font-bold text-purple-900">
            {filteredPartners.filter((p) => p.role === 'admin').length}
          </div>
          <div className="text-sm text-purple-700 mt-1">Administratoren</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-6">
          <div className="text-2xl font-bold text-green-900">
            {filteredPartners.filter((p) => p.weclapp_party_id).length}
          </div>
          <div className="text-sm text-green-700 mt-1">Mit Weclapp-ID</div>
        </div>
      </div>
    </div>
  );
}