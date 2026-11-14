import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ForumLayout from '../components/layout/ForumLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicRoute from './PublicRoute';

// Lightweight fallback for suspense transitions (no layout flashing)
const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center w-full">
    <div className="w-8 h-8 border-3 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy Loaded Public Pages
const LandingPage = lazy(() => import('../pages/LandingPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));

// Lazy Loaded Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Lazy Loaded User Pages
const Dashboard = lazy(() => import('../pages/user/Dashboard'));
const Courses = lazy(() => import('../pages/user/Courses'));
const Watch = lazy(() => import('../pages/user/Watch'));
const Affiliate = lazy(() => import('../pages/user/Affiliate'));
const Wallet = lazy(() => import('../pages/user/Wallet'));
const Invoices = lazy(() => import('../pages/user/Invoices'));
const Profile = lazy(() => import('../pages/user/Profile'));
const Rewards = lazy(() => import('../pages/user/Rewards'));

// Lazy Loaded Forum Pages (User Side)
const ForumPage = lazy(() => import('../pages/forum/ForumPage'));
const ForumThread = lazy(() => import('../pages/forum/ForumThread'));
const MyForumActivity = lazy(() => import('../pages/forum/MyForumActivity'));
const ForumWallet = lazy(() => import('../pages/forum/ForumWallet'));
const ForumNotifications = lazy(() => import('../pages/forum/ForumNotifications'));

// Lazy Loaded Admin Pages (Standard LMS)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminKyc = lazy(() => import('../pages/admin/AdminKyc'));
const AdminPackages = lazy(() => import('../pages/admin/AdminPackages'));
const AdminVideos = lazy(() => import('../pages/admin/AdminVideos'));
const AdminPayouts = lazy(() => import('../pages/admin/AdminPayouts'));
const AdminInvoiceSettings = lazy(() => import('../pages/admin/AdminInvoiceSettings'));
const AdminCertificateSettings = lazy(() => import('../pages/admin/AdminCertificateSettings'));
const AdminSessions = lazy(() => import('../pages/admin/AdminSessions'));
const AdminFraudAlerts = lazy(() => import('../pages/admin/AdminFraudAlerts'));

// Lazy Loaded Admin Forum Pages (Part 2)
const AdminForumDashboard = lazy(() => import('../pages/admin/forum/AdminForumDashboard'));
const AdminForumQuestions = lazy(() => import('../pages/admin/forum/AdminForumQuestions'));
const AdminForumQuestionDetail = lazy(() => import('../pages/admin/forum/AdminForumQuestionDetail'));
const AdminForumRewards = lazy(() => import('../pages/admin/forum/AdminForumRewards'));
const AdminForumReports = lazy(() => import('../pages/admin/forum/AdminForumReports'));
const AdminForumAuditLog = lazy(() => import('../pages/admin/forum/AdminForumAuditLog'));

const AppRouter = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
};

export default AppRouter;