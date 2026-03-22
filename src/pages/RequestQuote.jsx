import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Send, Plus, Trash2, ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RequestQuote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCustomerId = params.get('customerId');
    if (urlCustomerId) {
      setCustomerId(urlCustomerId);
      setFormData(prev => ({ ...prev, customer_id: urlCustomerId }));
    }
  }, []);

  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => base44.entities.Customer.list() });
  const { data: customer } = useQuery({ queryKey: ['customer', customerId], queryFn: () => base44.entities.Customer.list(), select: (data) => data.find(c => c.id === customerId), enabled: !!customerId });

  const [formData, setFormData] = useState({ customer_id: '', title: '', notes: '', items: [] });
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('alle');

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => base44.entities.Product.list() });

  const requestQuoteMutation = useMutation({
    mutationFn: async (data) => {
      const quoteData = {
        quote_number: `QT-${Date.now()}`,
        title: data.title,
        status: 'offen',
        amount: 0,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: data.items,
        notes: data.notes
      };
      return await base44.entities.Quote.create(quoteData);
    },
    onSuccess: () => {
      toast.success(t('requestQuote.successMsg'));
      if (customerId) navigate(createPageUrl(`CustomerView?id=${customerId}`));
      else navigate(createPageUrl('ResellerDashboard'));
    },
  });

  const handleSubmit = (e) => { e.preventDefault(); requestQuoteMutation.mutate(formData); };
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addItem = () => { setSelectedItemIndex(formData.items.length); setShowProductSelector(true); };

  const addProductToItem = (product, itemIndex) => {
    const newItem = { description: `${product.name} (${product.manufacturer})`, quantity: 1, unit_price: product.price, total: product.price, notes: '' };
    setFormData(prev => {
      if (itemIndex >= prev.items.length) return { ...prev, items: [...prev.items, newItem] };
      return { ...prev, items: prev.items.map((item, i) => i === itemIndex ? newItem : item) };
    });
    setShowProductSelector(false);
  };

  const removeItem = (index) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') updated.total = (updated.quantity || 0) * (updated.unit_price || 0);
        return updated;
      })
    }));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {customer && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">{t('requestQuote.bannerFor')} <strong>{customer.company_name}</strong></span>
            <Button asChild variant="outline" size="sm">
              <Link to={createPageUrl(`CustomerView?id=${customerId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('requestQuote.backToCustomer')}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <PageHeader
        title={t('requestQuote.title')}
        subtitle={customer ? t('requestQuote.subtitleFor', { name: customer.company_name }) : t('requestQuote.subtitleGeneral')}
        icon={FileText}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">{t('requestQuote.customerSection')}</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestQuote.selectCustomer')} <span className="text-red-500">*</span></label>
              <Select required value={formData.customer_id} onValueChange={(val) => handleChange('customer_id', val)} disabled={!!customerId}>
                <SelectTrigger><SelectValue placeholder={t('requestQuote.selectCustomerRequired')} /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name} ({c.contact_person})</SelectItem>)}</SelectContent>
              </Select>
              {customerId && <p className="text-xs text-slate-500 mt-1">{t('requestQuote.autoSelected')}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">{t('requestQuote.quoteInfo')}</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestQuote.titleLabel')} <span className="text-red-500">*</span></label>
              <Input required value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder={t('requestQuote.titlePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('requestQuote.notesLabel')}</label>
              <Textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder={t('requestQuote.notesPlaceholder')} className="min-h-[80px]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">{t('requestQuote.positions')}</h3>
              <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />{t('requestQuote.addPosition')}
              </Button>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">{t('requestQuote.noPositions')}</p>
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />{t('requestQuote.addFirst')}
                </Button>
              </div>
            )}

            {formData.items.map((item, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{t('requestQuote.position', { number: index + 1 })}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input required value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder={t('requestQuote.productDescription')} className="flex-1" />
                    <Button type="button" variant="outline" onClick={() => { setSelectedItemIndex(index); setShowProductSelector(true); }}><ShoppingCart className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">{t('requestQuote.quantity')}</label>
                      <Input type="number" min="1" required value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} placeholder={t('requestQuote.quantity')} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">{t('requestQuote.unitPrice')}</label>
                      <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">{t('requestQuote.total')}</label>
                      <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md font-semibold text-slate-700">{formatCurrency(item.total || 0)}</div>
                    </div>
                  </div>
                </div>
                <Textarea value={item.notes} onChange={(e) => updateItem(index, 'notes', e.target.value)} placeholder={t('requestQuote.additionalInfo')} className="min-h-[60px]" />
              </div>
            ))}
          </div>

          {totalAmount > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-700">{t('requestQuote.estimatedTotal')}</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" asChild className="flex-1">
              <Link to={customerId ? createPageUrl(`CustomerView?id=${customerId}`) : createPageUrl('ResellerDashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />{t('requestQuote.cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={requestQuoteMutation.isPending} className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
              <Send className="h-4 w-4 mr-2" />
              {requestQuoteMutation.isPending ? t('requestQuote.submitting') : t('requestQuote.submit')}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>{t('common.submit')}:</strong> {t('requestQuote.hint')}
      </div>

      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{t('requestQuote.selectProduct')}</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowProductSelector(false); setProductSearch(''); setProductCategory('alle'); }}><ArrowLeft className="h-4 w-4 mr-2" />{t('requestQuote.back')}</Button>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Produkt suchen..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Select value={productCategory} onValueChange={setProductCategory}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Kategorien</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Lizenzen">Lizenzen</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Zubehör">Zubehör</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products
                  .filter(p => {
                    const matchSearch = productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.manufacturer || '').toLowerCase().includes(productSearch.toLowerCase());
                    const matchCategory = productCategory === 'alle' || p.category === productCategory;
                    return matchSearch && matchCategory;
                  })
                  .map(product => (
                  <div key={product.id} onClick={() => addProductToItem(product, selectedItemIndex)} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 cursor-pointer transition-colors border-2 border-transparent hover:border-[#1e3a5f]">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="h-8 w-8 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 mb-1">{product.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{product.manufacturer}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1e3a5f]">{formatCurrency(product.price)}</span>
                          <span className="text-xs text-slate-500">{product.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}