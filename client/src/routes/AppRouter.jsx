import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// User Pages
import Dashboard from '../pages/user/Dashboard';
import Courses from '../pages/user/Courses';
import Watch from '../pages/user/Watch';
import Affiliate from '../pages/user/Affiliate';
import Wallet from '../pages/user/Wallet';
import Profile from '../pages/user/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminKyc from '../pages/admin/AdminKyc';
import AdminPackages from '../pages/admin/AdminPackages';
import AdminVideos from '../pages/admin/AdminVideos';
import AdminPayouts from '../pages/admin/AdminPayouts';
import AdminSessions from '../pages/admin/AdminSessions';
import AdminFraudAlerts from '../pages/admin/AdminFraudAlerts';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<Watch />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/admin/fraud-alerts" element={<AdminFraudAlerts />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
