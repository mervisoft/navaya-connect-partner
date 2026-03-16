/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistant from './pages/AIAssistant';
import Contact from './pages/Contact';
import Contracts from './pages/Contracts';
import CustomerView from './pages/CustomerView';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Documents from './pages/Documents';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import Invoices from './pages/Invoices';
import NewCustomer from './pages/NewCustomer';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import RequestQuote from './pages/RequestQuote';
import ResellerDashboard from './pages/ResellerDashboard';
import Shop from './pages/Shop';
import Tickets from './pages/Tickets';
import LicenseExtension from './pages/LicenseExtension';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "Contact": Contact,
    "Contracts": Contracts,
    "CustomerView": CustomerView,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Deliveries": Deliveries,
    "Documents": Documents,
    "FAQ": FAQ,
    "Home": Home,
    "Invoices": Invoices,
    "NewCustomer": NewCustomer,
    "OrderConfirmation": OrderConfirmation,
    "Orders": Orders,
    "Profile": Profile,
    "Projects": Projects,
    "Quotes": Quotes,
    "RequestQuote": RequestQuote,
    "ResellerDashboard": ResellerDashboard,
    "Shop": Shop,
    "Tickets": Tickets,
    "LicenseExtension": LicenseExtension,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};