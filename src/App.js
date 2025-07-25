import React,{ useEffect } from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import MainLayout from 'layout/MainLayout';
import Home from 'pages/Home/Home';
import ServicePackage from 'pages/ServicePackage/ServicePackage';
import Login from 'components/Auth/Login';
import Register from 'components/Auth/Register';
import Forgot from 'components/Auth/Forgot';
import ProtectedRoute from 'components/ProtectedRoute/ProtectedRoute';
import NotificationPage from 'pages/Notification';
import GroupPage from 'pages/Group';
import GroupDetail from 'pages/GroupDetail/GroupDetail';
import UserProfile from 'pages/Profile/UserProfile';
import EditProfile from 'pages/Profile/EditProfile';
import ChangePassword from 'pages/Profile/ChangePassword';
import BodyMeasurementPage from 'pages/BodyMeasurement';
import ReportHistory from 'pages/ReportHistory';
import ServicePackageDetail from 'pages/ServicePackageDetail';
import CheckoutPage from 'pages/Checkout';
import MyPostHistory from 'pages/MyPostHistory';
import ViewPostDetails from 'pages/MyPostHistory/ViewPostDetails';
import EditPost from 'pages/MyPostHistory/EditPost';
import SuccessPage from 'pages/Checkout/SuccessPage';
import CancelPage from 'pages/Checkout/CancelPage';
import MySubscriptionsPage from 'pages/Subscriptions';
import WeightHistoryPage from 'pages/Profile/WeightHistoryPage';
import UserWaterLogPage from 'pages/UserWaterLog';
import FoodListPage from 'pages/FoodList/FoodListPage';
import TrainerApplicationDetail from 'pages/TrainerApplication/TrainerApplicationDetail';
import NotFound from 'pages/404/NotFound';
import MyTrainerApplicationHistory from 'pages/TrainerApplication/MyTrainerApplicationHistory';
import MyCreatedGroups from 'pages/MyGroup/MyCreatedGroups';
import GroupJoinRequests from 'pages/MyGroup/GroupJoinRequests';
import GroupMembers from 'pages/MyGroup/GroupMembers';
import TrainerRegistration from 'pages/TrainerApplication/TrainerRegistration';
import MyServicesPage from 'pages/Trainer/PackageServices/MyServicesPage';
import MyServiceDetailPage from 'pages/Trainer/MyServicePackageDetail/MyServiceDetailPage';
import MyServiceEditPage from 'pages/Trainer/MyServiceEdit/MyServiceEditPage';
import TrainerStatisticsPage from 'pages/Trainer/Income/TrainerStatisticsPage';
import TrainerPayoutPage from 'pages/Trainer/Payout/TrainerPayoutPage';
import TrainerPayoutStatisticsPage from 'pages/Trainer/TrainerPayoutStatistics/TrainerPayoutStatisticsPage';
import MyTicketManagement from 'pages/MyTicket/MyTicketManagement';
import TicketDetailPage from 'pages/MyTicket/TicketDetailPage';
import { SnackbarProvider,useSnackbar } from 'notistack';
import About from 'pages/About/About';
import FAQ from 'pages/FAQ/FAQ';
import ChatInterface from 'pages/ChatTrial/HealthChatInterface';
import styled from '@emotion/styled';
import ActivateAccount from 'pages/activateAccount/ActivateAccount';
import PrivacyPolicy from 'pages/Privacy/PrivacyPolicy';
import TermsOfService from 'pages/TermsOfService/TermsOfService';
import AppPreviewLanding from 'pages/AppPreview/appPreviewLanding';
import ChatSupport from 'pages/ChatSupport/ChatSupport';
import ProfilePage from 'components/Auth/ProfilePage';
import Verify from 'pages/Verify/Verify';

function SnackbarSetup() {
    const { closeSnackbar } = useSnackbar();

    useEffect(() => {
        window.snackbarClose = closeSnackbar;
    },[closeSnackbar]);

    return null;
}
function App() {
    return (
        <AuthProvider>
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top',horizontal: 'right' }}>
                <SnackbarSetup />
                <BrowserRouter>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/experience" element={<AppPreviewLanding />} />
                            <Route path="/Auth/activate" element={<ActivateAccount />} />
                            <Route path="/chat" element={<ChatInterface />} />
                            <Route path="/services" element={<ServicePackage />} />
                            <Route path="/service-packages/:packageId" element={<ServicePackageDetail />} />
                            <Route path="/trainer/view/:trainerId" element={<TrainerApplicationDetail />} />
                            <Route path="/foods" element={<FoodListPage />} />
                            <Route path="/groups" element={<GroupPage />} />
                            <Route path="/groups/:groupId" element={<GroupDetail />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-and-conditions" element={<TermsOfService />} />
                            <Route
                                path="/notifications"
                                element={
                                    <ProtectedRoute>
                                        <NotificationPage />
                                    </ProtectedRoute>
                                }
                            />
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
                                path="/profile/application-history"
                                element={
                                    <ProtectedRoute>
                                        <MyTrainerApplicationHistory />
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
                                path="/profile/water-log"
                                element={
                                    <ProtectedRoute>
                                        <UserWaterLogPage />
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
                                path="/my-ticket"
                                element={
                                    <ProtectedRoute>
                                        <MyTicketManagement />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-ticket/detail/:ticketId"
                                element={
                                    <ProtectedRoute>
                                        <TicketDetailPage />
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
                                path="/my-groups/view"
                                element={
                                    <ProtectedRoute>
                                        <MyCreatedGroups />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-groups/:groupId/requests"
                                element={
                                    <ProtectedRoute>
                                        <GroupJoinRequests />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-groups/:groupId/members"
                                element={
                                    <ProtectedRoute>
                                        <GroupMembers />
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
                            <Route
                                path="/booking-services/success"
                                element={
                                    <ProtectedRoute>
                                        <SuccessPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/booking-services/cancel"
                                element={
                                    <ProtectedRoute>
                                        <CancelPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer-registration"
                                element={
                                    <ProtectedRoute>
                                        <TrainerRegistration />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/my-services"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <MyServicesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/service-detail/:packageId"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <MyServiceDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/service-edit/:packageId"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <MyServiceEditPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/service-statistics/view"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <TrainerStatisticsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/payout/view"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <TrainerPayoutPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/trainer/payout-statistics/view"
                                element={
                                    <ProtectedRoute requiredRoles={['Trainer']}>
                                        <TrainerPayoutStatisticsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/provide-profile" element={<ProfilePage />} />
                        <Route path="/forgot-password" element={<Forgot />} />
                        <Route path="/chat-room-support/:joinNow/:roomId" element={<ChatSupport />} />
                    </Routes>
                </BrowserRouter>
            </SnackbarProvider>
        </AuthProvider>
    );
}

export default App;