import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Homepage from './pages/Core/Homepage';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/homepage" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
