import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  Truck, 
  TicketCheck, 
  FileCheck, 
  FolderKanban, 
  Files,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Calculator
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getResellerNavItems = (t) => [
  { name: t('nav.dashboard'), icon: LayoutDashboard, page: 'ResellerDashboard' },
  { name: t('nav.customers'), icon: User, page: 'Customers' },
];

const getCustomerNavItems = (t) => {
  const customerId = localStorage.getItem('activeCustomerId');
  return [
    { name: t('nav.dashboard'), icon: LayoutDashboard, page: 'CustomerView', params: customerId ? `?id=${customerId}` : '' },
    { name: t('nav.shop'), icon: ShoppingCart, page: 'Shop', params: customerId ? `?customerId=${customerId}` : '' },
    { name: t('nav.requestQuote'), icon: FileText, page: 'RequestQuote', params: customerId ? `?customerId=${customerId}` : '' },
    { name: t('nav.licenseExtension'), icon: Calculator, page: 'LicenseExtension', params: '' },
    { name: t('nav.quotes'), icon: FileText, page: 'Quotes', params: '' },
    { name: t('nav.orders'), icon: ShoppingCart, page: 'Orders', params: '' },
    { name: t('nav.invoices'), icon: Receipt, page: 'Invoices', params: '' },
    { name: t('nav.deliveries'), icon: Truck, page: 'Deliveries', params: '' },
    { name: t('nav.tickets'), icon: TicketCheck, page: 'Tickets', params: '' },
    { name: t('nav.contracts'), icon: FileCheck, page: 'Contracts', params: '' },
    { name: t('nav.projects'), icon: FolderKanban, page: 'Projects', params: '' },
    { name: t('nav.documents'), icon: Files, page: 'Documents', params: '' },
  ];
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isCustomerView, setIsCustomerView] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const { t } = useTranslation();

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('id') || params.get('customerId');
    
    // Load or retrieve customer ID from localStorage
    if (customerId) {
      localStorage.setItem('activeCustomerId', customerId);
    }
    
    const activeCustomerId = customerId || localStorage.getItem('activeCustomerId');
    const inCustomerContext = !!activeCustomerId || ['CustomerView', 'Shop', 'RequestQuote', 'Quotes', 'Orders', 'Invoices', 'Deliveries', 'Tickets', 'Contracts', 'Projects', 'Documents'].includes(currentPageName);
    setIsCustomerView(inCustomerContext);

    // Load customer data if in customer view
    if (activeCustomerId) {
      const loadCustomer = async () => {
        try {
          const customers = await base44.entities.Customer.list();
          const customer = customers.find(c => c.id === activeCustomerId);
          if (customer) {
            setCurrentCustomer(customer);
          } else {
            setCurrentCustomer(null);
            localStorage.removeItem('activeCustomerId');
          }
        } catch (e) {
          console.log('Error loading customer');
          setCurrentCustomer(null);
        }
      };
      loadCustomer();
    } else {
      setCurrentCustomer(null);
    }
  }, [currentPageName]);

  const navItems = isCustomerView ? getCustomerNavItems() : resellerNavItems;

  const handleLogout = () => {
    localStorage.removeItem('activeCustomerId');
    base44.auth.logout();
  };

  const handleBackToReseller = () => {
    localStorage.removeItem('activeCustomerId');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
      <style>{`
        :root {
          --primary: #1e3a5f;
          --primary-light: #2d4a6f;
          --accent: #0ea5e9;
          --accent-light: #38bdf8;
        }
      `}</style>

      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-72 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-6">
            {isCustomerView && currentCustomer && (
              <Button asChild variant="outline" size="sm" onClick={handleBackToReseller}>
                <Link to={createPageUrl('ResellerDashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Zurück zum Reseller Dashboard
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to={createPageUrl('ResellerDashboard')}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Reseller Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={createPageUrl('AIAssistant')}>
                <Bot className="h-4 w-4 mr-2" />
                KI-Assistent
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={createPageUrl('Contact')}>
                Kontakt zu Mervisoft
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to={createPageUrl('FAQ')}>
                FAQ
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="border border-slate-200">
              <Link to={createPageUrl('DesignGuide')}>
                <Palette className="h-4 w-4 mr-2" />
                Design Guide
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0ea5e9] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800 block truncate">
                {currentCustomer ? currentCustomer.company_name : 'Kundenportal'}
              </span>
              {currentCustomer && (
                <span className="text-xs text-slate-500">Kundenansicht</span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCustomerView && (
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('ResellerDashboard')} onClick={handleBackToReseller}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Zurück zum Reseller Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('AIAssistant')}>
                  <Bot className="h-4 w-4 mr-2" />
                  KI-Assistent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Contact')}>
                  Kontakt zu Mervisoft
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('FAQ')}>
                  FAQ
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-72 
        bg-white/95 backdrop-blur-xl border-r border-slate-200/60
        transform transition-transform duration-300 ease-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-sky-200/50">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">
                  {currentCustomer ? 'Kundenansicht' : 'Kundenportal'}
                </h1>
                <p className="text-xs text-slate-400 truncate">
                  {currentCustomer ? currentCustomer.company_name : 'Self-Service Center'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const url = item.params ? `${item.page}${item.params}` : item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(url)}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white shadow-lg shadow-slate-300/30' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-sky-300' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-slate-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-800 truncate">{user.full_name || 'Benutzer'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Profile')} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profil bearbeiten
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-16">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}