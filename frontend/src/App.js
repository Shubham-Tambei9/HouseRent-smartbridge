import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import ManagePropertyBookings from './pages/ManagePropertyBookings';
import MyListings from './pages/MyListings';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route
          path="/properties/add"
          element={
            <PrivateRoute>
              <AddProperty />
            </PrivateRoute>
          }
        />
        <Route
          path="/properties/:id/edit"
          element={
            <PrivateRoute>
              <EditProperty />
            </PrivateRoute>
          }
        />
        <Route
          path="/properties/:id/bookings"
          element={
            <PrivateRoute>
              <ManagePropertyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <PrivateRoute>
              <MyListings />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
