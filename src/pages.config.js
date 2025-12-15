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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};