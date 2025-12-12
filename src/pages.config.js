import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Dashboard": Dashboard,
    "Quotes": Quotes,
    "Orders": Orders,
    "Invoices": Invoices,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};