import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Deliveries from './pages/Deliveries';
import Tickets from './pages/Tickets';
import Contracts from './pages/Contracts';
import Projects from './pages/Projects';
import Documents from './pages/Documents';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "Quotes": Quotes,
    "Orders": Orders,
    "Invoices": Invoices,
    "Deliveries": Deliveries,
    "Tickets": Tickets,
    "Contracts": Contracts,
    "Projects": Projects,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};