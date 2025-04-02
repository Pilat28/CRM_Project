import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import ProductionDashboard from './pages/ProductionDashboard';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Navbar from './components/Navbar';
import OrderBuilder from './pages/OrderBuilder';


function App() {
  const { token } = useContext(AuthContext);

  const getRole = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return JSON.parse(decoded.sub)?.role;
    } catch {
      return null;
    }
  };

  const role = getRole();

  const ProtectedRoute = ({ children, allowed }) => {
    if (!token) return <Navigate to="/" />;
    if (!allowed.includes(role)) return <Navigate to="/not-found" />;
    return children;
  };

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/production" element={<ProductionDashboard />} />
          <Route path="/order-builder" element={<OrderBuilder />} />
        </Routes>
      </div>
    </Router>
  );
  
}

export default App;
