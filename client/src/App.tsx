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
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import {Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="/" element={<Navigate to="/homepage" />} />
        </Routes>
        </ProductProvider>
      </AuthProvider>
      <Toaster /> 
    </Router>
  );
};

export default App;
