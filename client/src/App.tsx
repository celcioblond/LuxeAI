import { Toaster } from 'react-hot-toast';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import DashboardLayout from './components/Admin Dashboard/DashboardLayout';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminUsers from './pages/Admin/AdminUsers';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Cart from './pages/Core/Cart';
import Checkout from './pages/Core/Checkout';
import Homepage from './pages/Core/Homepage';
import MyOrders from './pages/Core/MyOrders';
import OrderConfirmation from './pages/Core/OrderConfirmation';
import ProductDetails from './pages/Core/ProductDetails';
import Recommendations from './pages/Core/Recommendations';

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/order-confirmation/:id"
                  element={<OrderConfirmation />}
                />
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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
