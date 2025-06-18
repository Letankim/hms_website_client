import { BrowserRouter,Routes,Route } from "react-router-dom";
import { AuthProvider } from "contexts/AuthContext";
import MainLayout from "layout/MainLayout";
import Home from "pages/Home";
import AboutPage from "pages/About";
import ServicePackage from "pages/ServicePackage";
import BlogPage from "pages/Blog";
import Login from "components/Auth/Login";
import Register from "components/Auth/Register";
import Forgot from "components/Auth/Forgot";
import ProtectedRoute from "components/ProtectedRoute/ProtectedRoute";
import NotificationPage from "pages/Notification";
import GroupPage from "pages/Group";
import GroupDetail from "./pages/GroupDetail";
import UserProfile from "pages/Profile/UserProfile";
import EditProfile from "pages/Profile/EditProfile";
import ChangePassword from "pages/Profile/ChangePassword";
import BodyMeasurementPage from "pages/BodyMeasurement";
import ReportHistory from 'pages/ReportHistory';
import ServicePackageDetail from "pages/ServicePackageDetail";
import CheckoutPage from "pages/Checkout";
import MyPostHistory from "pages/MyPostHistory";
import ViewPostDetails from "pages/MyPostHistory/ViewPostDetails";
import EditPost from "pages/MyPostHistory/EditPost";
import SuccessPage from "pages/Checkout/SuccessPage";
import CancelPage from "pages/Checkout/CancelPage";
import MySubscriptionsPage from "pages/Subscriptions";
import WeightHistoryPage from "pages/Profile/WeightHistoryPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicePackage />} />
            <Route path="/service-packages/:packageId" element={<ServicePackageDetail />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/body"
              element={
                <ProtectedRoute>
                  <BodyMeasurementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/weight-history"
              element={
                <ProtectedRoute>
                  <WeightHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/body-measurements"
              element={
                <ProtectedRoute>
                  <BodyMeasurementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <ReportHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <ProtectedRoute>
                  <MyPostHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-subscriptions"
              element={
                <ProtectedRoute>
                  <MySubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts/:postId/view"
              element={
                <ProtectedRoute>
                  <ViewPostDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts/:postId/edit"
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/:packageId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="/booking-services/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
            <Route path="/booking-services/cancel" element={<ProtectedRoute><CancelPage /></ProtectedRoute>} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;