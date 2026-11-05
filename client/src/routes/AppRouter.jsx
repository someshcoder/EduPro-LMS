import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ForumLayout from '../components/layout/ForumLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicRoute from './PublicRoute';

import LandingPage from '../pages/LandingPage';
import ContactPage from '../pages/ContactPage';
import AboutPage from '../pages/AboutPage';

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
import Invoices from '../pages/user/Invoices';
import Profile from '../pages/user/Profile';
import Rewards from '../pages/user/Rewards';

// Forum Pages (User Side)
import ForumPage from '../pages/forum/ForumPage';
import ForumThread from '../pages/forum/ForumThread';
import MyForumActivity from '../pages/forum/MyForumActivity';
import ForumWallet from '../pages/forum/ForumWallet';
import ForumNotifications from '../pages/forum/ForumNotifications';

// Admin Pages (Standard LMS)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminKyc from '../pages/admin/AdminKyc';
import AdminPackages from '../pages/admin/AdminPackages';
import AdminVideos from '../pages/admin/AdminVideos';
import AdminPayouts from '../pages/admin/AdminPayouts';
import AdminInvoiceSettings from '../pages/admin/AdminInvoiceSettings';
import AdminCertificateSettings from '../pages/admin/AdminCertificateSettings';
import AdminSessions from '../pages/admin/AdminSessions';
import AdminFraudAlerts from '../pages/admin/AdminFraudAlerts';

// Admin Forum Pages (Part 2)
import AdminForumDashboard from '../pages/admin/forum/AdminForumDashboard';
import AdminForumQuestions from '../pages/admin/forum/AdminForumQuestions';
import AdminForumQuestionDetail from '../pages/admin/forum/AdminForumQuestionDetail';
import AdminForumRewards from '../pages/admin/forum/AdminForumRewards';
import AdminForumReports from '../pages/admin/forum/AdminForumReports';
import AdminForumAuditLog from '../pages/admin/forum/AdminForumAuditLog';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Public forum feed (read-only browsing for guests & students) */}
      <Route element={<ForumLayout />}>
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/question/:id" element={<ForumThread />} />
      </Route>

      {/* Guest-only routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* User protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<Watch />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/profile" element={<Profile />} />

          {/* Forum authenticated routes (inside MainLayout) */}
          <Route path="/forum/my-activity" element={<MyForumActivity />} />
          <Route path="/forum/wallet" element={<ForumWallet />} />
          <Route path="/forum/notifications" element={<ForumNotifications />} />
        </Route>
      </Route>

      {/* Admin protected routes */}
      <Route element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/invoice-settings" element={<AdminInvoiceSettings />} />
          <Route path="/admin/certificate-settings" element={<AdminCertificateSettings />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/admin/fraud-alerts" element={<AdminFraudAlerts />} />

          {/* Admin Forum Management Routes (Part 2) */}
          <Route path="/admin/forum" element={<AdminForumDashboard />} />
          <Route path="/admin/forum/questions" element={<AdminForumQuestions />} />
          <Route path="/admin/forum/questions/:id" element={<AdminForumQuestionDetail />} />
          <Route path="/admin/forum/rewards" element={<AdminForumRewards />} />
          <Route path="/admin/forum/reports" element={<AdminForumReports />} />
          <Route path="/admin/forum/audit" element={<AdminForumAuditLog />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
