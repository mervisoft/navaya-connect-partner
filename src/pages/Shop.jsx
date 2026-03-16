import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Plus,
  Minus,
  Trash2,
  Package,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Shop() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productLineFilter, setProductLineFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [upgradeFromFilter, setUpgradeFromFilter] = useState('all');
  const [upgradeToFilter, setUpgradeToFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCustomerId(params.get('customerId'));
  }, []);

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => base44.entities.Customer.list(),
    select: (data) => data.find(c => c.id === customerId),
    enabled: !!customerId,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  // Dynamically derive available product lines and subcategories based on active filters
  const availableProductLines = useMemo(() => {
    const lines = products
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
      .map(p => p.product_line)
      .filter(Boolean);
    return [...new Set(lines)].sort();
  }, [products, categoryFilter]);

  const availableSubcategories = useMemo(() => {
    const subs = products
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
      .filter(p => productLineFilter === 'all' || p.product_line === productLineFilter)
      .map(p => p.subcategory)
      .filter(Boolean);
    return [...new Set(subs)].sort();
  }, [products, categoryFilter, productLineFilter]);

  const isUpgradeFilterActive = subcategoryFilter === 'Upgrade';

  const availableUpgradeFromVersions = useMemo(() => {
    if (!isUpgradeFilterActive) return [];
    const versions = products
      .filter(p => p.subcategory === 'Upgrade')
      .filter(p => productLineFilter === 'all' || p.product_line === productLineFilter)
      .map(p => p.upgrade_from_version)
      .filter(Boolean);
    return [...new Set(versions)].sort();
  }, [products, productLineFilter, isUpgradeFilterActive]);

  const availableUpgradeToVersions = useMemo(() => {
    if (!isUpgradeFilterActive) return [];
    const versions = products
      .filter(p => p.subcategory === 'Upgrade')
      .filter(p => productLineFilter === 'all' || p.product_line === productLineFilter)
      .filter(p => upgradeFromFilter === 'all' || p.upgrade_from_version === upgradeFromFilter)
      .map(p => p.upgrade_to_version)
      .filter(Boolean);
    return [...new Set(versions)].sort();
  }, [products, productLineFilter, isUpgradeFilterActive, upgradeFromFilter]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesLine = productLineFilter === 'all' || product.product_line === productLineFilter;
    const matchesSub = subcategoryFilter === 'all' || product.subcategory === subcategoryFilter;
    const matchesFrom = upgradeFromFilter === 'all' || product.upgrade_from_version === upgradeFromFilter;
    const matchesTo = upgradeToFilter === 'all' || product.upgrade_to_version === upgradeToFilter;
    return matchesSearch && matchesCategory && matchesLine && matchesSub && matchesFrom && matchesTo;
  });

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setProductLineFilter('all');
    setSubcategoryFilter('all');
  };

  const handleProductLineChange = (val) => {
    setProductLineFilter(val);
    setSubcategoryFilter('all');
    setUpgradeFromFilter('all');
    setUpgradeToFilter('all');
  };

  const handleSubcategoryChange = (val) => {
    setSubcategoryFilter(val);
    setUpgradeFromFilter('all');
    setUpgradeToFilter('all');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} ${t('shop.added')}`);
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      return await base44.entities.Order.create(orderData);
    },
    onSuccess: () => {
      setCart([]);
      setCartOpen(false);
      navigate(createPageUrl('OrderConfirmation'));
    },
  });

  const handleCheckout = () => {
    if (!customerId) {
      toast.error('Bitte wählen Sie einen Kunden aus');
      return;
    }

    const orderData = {
      order_number: `ORD-${Date.now()}`,
      title: `Bestellung vom ${new Date().toLocaleDateString('de-DE')}`,
      status: 'neu',
      amount: cartTotal,
      order_date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        description: `${item.name} (${item.manufacturer})`,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="space-y-6">
      {/* Customer Context Banner */}
      {customer && (
        <Alert className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <Package className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-emerald-800">
              {t('shop.shopFor')} <strong>{customer.company_name}</strong>
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to={createPageUrl(`CustomerView?id=${customerId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('shop.backToCustomer')}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <PageHeader
        title={t('shop.title')}
        subtitle={customer ? t('shop.subtitleFor', { name: customer.company_name }) : t('shop.subtitle')}
        icon={Package}
        actions={
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('shop.cart')}
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{t('shop.cart')} ({t('shop.cartItems', { count: cartItemCount })})</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">{t('shop.cartEmpty')}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                              <p className="text-xs text-slate-500">{item.manufacturer}</p>
                              <p className="font-bold text-slate-800 mt-1">{formatCurrency(item.price)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="ml-auto font-semibold text-slate-800">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-slate-800">{t('shop.total')}</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
                      </div>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700" 
                        size="lg"
                        onClick={handleCheckout}
                        disabled={createOrderMutation.isPending || !customerId}
                      >
                        {createOrderMutation.isPending ? t('shop.ordering') : t('shop.checkout')}
                      </Button>
                      {!customerId && (
                        <p className="text-xs text-red-600 text-center mt-2">
                          {t('shop.noCustomer')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Kategorie */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('shop.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-44 bg-white">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Lizenzen">Lizenzen</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Zubehör">Zubehör</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Produktlinie + Unterkategorie (nur wenn verfügbar) */}
        {(availableProductLines.length > 0 || availableSubcategories.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {availableProductLines.length > 0 && (
              <Select value={productLineFilter} onValueChange={handleProductLineChange}>
                <SelectTrigger className="w-full sm:w-52 bg-white border-slate-200">
                  <SelectValue placeholder="Produktlinie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Produktlinien</SelectItem>
                  {availableProductLines.map(line => (
                    <SelectItem key={line} value={line}>{line}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {availableSubcategories.length > 0 && (
              <Select value={subcategoryFilter} onValueChange={handleSubcategoryChange}>
                <SelectTrigger className="w-full sm:w-44 bg-white border-slate-200">
                  <SelectValue placeholder="Lizenztyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Lizenztypen</SelectItem>
                  {availableSubcategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(productLineFilter !== 'all' || subcategoryFilter !== 'all') && (
              <button
                onClick={() => { setProductLineFilter('all'); setSubcategoryFilter('all'); setUpgradeFromFilter('all'); setUpgradeToFilter('all'); }}
                className="text-xs text-slate-500 hover:text-slate-800 underline self-center"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Row 3: Upgrade-Versionsfilter */}
        {isUpgradeFilterActive && (availableUpgradeFromVersions.length > 0 || availableUpgradeToVersions.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <span className="text-xs text-slate-500 font-medium shrink-0">Upgrade von:</span>
            {availableUpgradeFromVersions.length > 0 && (
              <Select value={upgradeFromFilter} onValueChange={(val) => { setUpgradeFromFilter(val); setUpgradeToFilter('all'); }}>
                <SelectTrigger className="w-full sm:w-44 bg-white border-slate-200">
                  <SelectValue placeholder="Quellversion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Versionen</SelectItem>
                  {availableUpgradeFromVersions.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <span className="text-xs text-slate-500 font-medium shrink-0">auf:</span>
            {availableUpgradeToVersions.length > 0 && (
              <Select value={upgradeToFilter} onValueChange={setUpgradeToFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-white border-slate-200">
                  <SelectValue placeholder="Zielversion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Versionen</SelectItem>
                  {availableUpgradeToVersions.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-8 bg-slate-200 rounded w-28" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Keine Produkte gefunden"
          description="Versuchen Sie andere Suchkriterien"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produkt</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 text-right">Verfügbarkeit</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 text-right">Preis</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-36 text-right">Aktion</span>
          </div>

          {filteredProducts.map((product, index) => {
            const cartItem = cart.find(i => i.id === product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
              >
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      : <Package className="h-5 w-5 text-slate-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm truncate">{product.name}</span>
                      {product.featured && <Badge className="bg-amber-500 text-[10px] px-1.5 py-0 shrink-0">Top</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.manufacturer && <span className="text-xs text-slate-400">{product.manufacturer}</span>}
                      {product.category && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{product.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="w-28 text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                    product.availability === 'Auf Lager'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {product.availability || 'Auf Anfrage'}
                  </span>
                </div>

                {/* Price */}
                <div className="w-28 text-right">
                  <p className="font-bold text-slate-900 text-sm">{formatCurrency(product.price)}</p>
                  {product.list_price && product.list_price > product.price && (
                    <p className="text-xs text-slate-400 line-through">{formatCurrency(product.list_price)}</p>
                  )}
                </div>

                {/* Add to Cart */}
                <div className="w-36 flex justify-end">
                  {cartItem ? (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800">{cartItem.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[#1e3a5f] hover:bg-[#2d4a6f] h-8 text-xs"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Hinzufügen
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}