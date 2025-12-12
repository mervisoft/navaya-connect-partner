import Home from './pages/Home';
import Contracts from './pages/Contracts';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Documents from './pages/Documents';
import Invoices from './pages/Invoices';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Tickets from './pages/Tickets';
import ResellerDashboard from './pages/ResellerDashboard';
import NewCustomer from './pages/NewCustomer';
import RequestQuote from './pages/RequestQuote';
import Shop from './pages/Shop';
import CustomerView from './pages/CustomerView';
import Customers from './pages/Customers';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Contracts": Contracts,
    "Dashboard": Dashboard,
    "Deliveries": Deliveries,
    "Documents": Documents,
    "Invoices": Invoices,
    "Orders": Orders,
    "Profile": Profile,
    "Projects": Projects,
    "Quotes": Quotes,
    "Tickets": Tickets,
    "ResellerDashboard": ResellerDashboard,
    "NewCustomer": NewCustomer,
    "RequestQuote": RequestQuote,
    "Shop": Shop,
    "CustomerView": CustomerView,
    "Customers": Customers,
    "Contact": Contact,
    "FAQ": FAQ,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};