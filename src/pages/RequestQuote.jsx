import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Send, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RequestQuote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState(null);
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCustomerId = params.get('customerId');
    if (urlCustomerId) {
      setCustomerId(urlCustomerId);
      setFormData(prev => ({ ...prev, customer_id: urlCustomerId }));
    }
  }, []);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => base44.entities.Customer.list(),
    select: (data) => data.find(c => c.id === customerId),
    enabled: !!customerId,
  });

  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    notes: '',
    items: [{ description: '', quantity: 1, notes: '' }],
  });

  const requestQuoteMutation = useMutation({
    mutationFn: async (data) => {
      // Mockup: In Realität würde hier eine Anfrage an weclapp gehen
      return Promise.resolve(data);
    },
    onSuccess: () => {
      toast.success('Angebotsanfrage erfolgreich versendet!');
      navigate(createPageUrl('ResellerDashboard'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    requestQuoteMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, notes: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Customer Context Banner */}
      {customer && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">
              Angebotsanfrage für <strong>{customer.company_name}</strong>
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to={createPageUrl(`CustomerView?id=${customerId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Kunden
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <PageHeader
        title="Angebot für Kunden anfragen"
        subtitle={customer ? `Individuelles Angebot für ${customer.company_name}` : "Fordern Sie ein individuelles Angebot für Ihren Kunden an"}
        icon={FileText}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kunde auswählen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
              Kunde
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kunde auswählen <span className="text-red-500">*</span>
              </label>
              <Select 
                required
                value={formData.customer_id} 
                onValueChange={(val) => handleChange('customer_id', val)}
                disabled={!!customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bitte wählen Sie einen Kunden" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name} ({customer.contact_person})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customerId && (
                <p className="text-xs text-slate-500 mt-1">
                  Kunde wurde automatisch ausgewählt
                </p>
              )}
            </div>
          </div>

          {/* Angebotsinformationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
              Angebotsinformationen
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titel <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="z.B. Microsoft 365 Lizenzen für 50 Benutzer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Allgemeine Notizen
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Besondere Anforderungen, Deadlines, etc..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Positionen */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">
                Positionen
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Position {index + 1}</span>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3">
                    <Input
                      required
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Produktbeschreibung"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      placeholder="Menge"
                    />
                  </div>
                </div>

                <Textarea
                  value={item.notes}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Zusätzliche Informationen zu dieser Position..."
                  className="min-h-[60px]"
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              asChild
              className="flex-1"
            >
              <Link to={createPageUrl('ResellerDashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Abbrechen
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={requestQuoteMutation.isPending}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            >
              <Send className="h-4 w-4 mr-2" />
              {requestQuoteMutation.isPending ? 'Sendet...' : 'Angebot anfragen'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Hinweis:</strong> Die Angebotsanfrage wird direkt an weclapp übermittelt und von unserem Vertriebsteam bearbeitet. Sie erhalten das fertige Angebot per E-Mail.
      </div>
    </div>
  );
}