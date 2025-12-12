import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Plus,
  Minus,
  Trash2,
  X,
  Package,
  ArrowLeft
} from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
    toast.success(`${product.name} zum Warenkorb hinzugefügt`);
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

  const handleCheckout = () => {
    toast.success('Bestellung wird verarbeitet...');
    setCart([]);
    setCartOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Customer Context Banner */}
      {customer && (
        <Alert className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <Package className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-emerald-800">
              Shop für <strong>{customer.company_name}</strong>
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
        title="Shop"
        subtitle={customer ? `Produkte und Lizenzen für ${customer.company_name}` : "Produkte und Lizenzen für Ihre Kunden bestellen"}
        icon={Package}
        actions={
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Warenkorb
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Warenkorb ({cartItemCount} Artikel)</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Ihr Warenkorb ist leer</p>
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
                        <span className="text-lg font-semibold text-slate-800">Gesamtsumme:</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
                      </div>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700" 
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Zur Kasse
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Produkte durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
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

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-lg mb-4" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-24 w-24 text-slate-400" />
                  )}
                  {product.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-500">Empfohlen</Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">{product.category}</Badge>
                    <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-[#1e3a5f] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500">{product.manufacturer}</p>
                  </div>

                  {product.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
                      {product.list_price && product.list_price > product.price && (
                        <p className="text-xs text-slate-400 line-through">{formatCurrency(product.list_price)}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        product.availability === 'Auf Lager' 
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
                          : 'border-amber-200 text-amber-700 bg-amber-50'
                      }
                    >
                      {product.availability}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    In den Warenkorb
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}