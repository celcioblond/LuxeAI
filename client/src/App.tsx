import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Homepage from './pages/Core/Homepage';
import ProductDetails from './pages/Core/ProductDetails';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Cart from './pages/Core/Cart';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Admin Dashboard/DashboardLayout';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import Checkout from './pages/Core/Checkout';
import OrderConfirmation from './pages/Core/OrderConfirmation';
import MyOrders from './pages/Core/MyOrders';
import Recommendations from './pages/Core/Recommendations';
import {Toaster } from "react-hot-toast";
import { CartProvider } from './context/CartContext';

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/recommendations" element={<Recommendations />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<DashboardLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/homepage" />} />
            </Routes>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
