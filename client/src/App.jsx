import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import { AuthProvider } from './context/AuthContext';
import { setNavigator } from './services/axios';
import { ADMIN_ROLE, MANAGER_ROLE, NORMAL_ROLE, LECTURER_ROLE } from './constants';
import Home from './pages/Home/Home';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import ProfileSettingsPage from './pages/ProfileSettings/ProfileSettings';
import CourseDetailPage from './pages/CourseDetailPage/CourseDetialPage';
import OurCoursesPage from './pages/OurCoursesPage/OurCoursesPage';
import SubCourseDetailPage from './pages/SubCourseDetailPage/SubCourseDetailPage';
import CourseCompletionCertificatePage from './pages/CourseCompletionCertificatePage/CourseCompletionCertificatePage';
import AdminPanelPage from './pages/AdminPanelPage/AdminPanelPage';
import ManageLecturersPage from './pages/ManageLecturersPage/ManageLecturersPage';
import AddLecturerPage from './pages/AddLecturersPage/AddLecturersPage';
import UpdateLecturersPage from './pages/UpdateLecturersPage/UpdateLecturersPage';
import LectureViewerPage from './pages/LectureViewerPage/LectureViewerPage';
import UserEnrollmentAndSubscriptionPage from './pages/UserEnrollmentAndSubscriptionPage/UserEnrollmentAndSubscriptionPage';
import CourseManagementPage from './pages/CourseManagementPage/CourseManagementPage';
import AddCourseInfoPage from './components/CourseCreationComponents/AddCourseInfoPage';
import AddNewSubCourse from './components/AddNewSubCourse/AddNewSubCourse';
import AddNewMainCourse from './components/AddNewMainCourse/AddNewMainCourse';
import AddModulePage from './components/AddNewSubCourse/AddModulePage';
import SavedCoursesPage from './pages/SavedCoursesPage/SavedCoursesPage';
import EnrolledCoursesPage from './pages/EnrolledCoursesPage/EnrolledCoursesPage';
import CompletionCertificatesPage from './pages/CompletionCertificatesPage/CompletionCertificatesPage';
import UploadCourseMaterialsPage from './pages/UploadCourseMaterialsPage/UploadCourseMaterialsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsOfService from './pages/TermsOfServicePage/TermsOfServicePage';
import ContactUs from './pages/ContactUsPage/ContactUsPage';
import AboutUs from './pages/AboutUsPage/AboutUsPage';
import UnauthorizedPage from './pages/UnauthorizedPage/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LecturerCertificate from './components/LecturerCertificate/LecturerCertificate';
import VerifyEmailPage from './pages/VerifyEmailPage/VerifyEmailPage'
import ResetPasswordPage from './components/ResetPassword/ResetPassword';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import PricingPromotionsPage from './pages/PricingAndPromotionsPage/PricingAndPromotionsPage';
function App() {
  const navigate = useNavigate(); // Get the navigate function from React Router

  useEffect(() => {
    setNavigator(navigate); // Inject the navigate function into your axios setup
  }, [navigate]); // Re-run if navigate function ever changes (unlikely for a static app)

  const ALL_AUTHENTICATED_ROLES = [ADMIN_ROLE, MANAGER_ROLE, NORMAL_ROLE, LECTURER_ROLE];
  const ADMIN_AND_MANAGER_ROLES = [ADMIN_ROLE, MANAGER_ROLE];
  const ADMIN_MANAGER_LECTURER_ROLES = [ADMIN_ROLE, MANAGER_ROLE, LECTURER_ROLE];
  const ADMIN_ONLY_ROLE = [ADMIN_ROLE];

  return (
    // Remove <Router> wrapper here
    <AuthProvider>
      <CourseProvider>
        <Routes>
          {/* Route without Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* NEW ROUTE */}
          {/* Routes with Layout */}
          <Route element={<Layout />}>
            {/* Routes accessible by ALL authenticated users */}
            {/* <Route element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES} />}> */}
            <Route path='/unauthorized' element={<UnauthorizedPage />} />
          <Route path="/" element={<Home />} />
              <Route path="/our-courses" element={<OurCoursesPage />} />
              <Route path="/profile-settings" element={<ProfileSettingsPage />} />
              <Route path="/course-detail/:id" element={<CourseDetailPage />} />
              <Route path="/sub-course/:id" element={<SubCourseDetailPage />} />
              <Route path="/sub-course/:subCourseId/lecture/:lectureId" element={<LectureViewerPage />} />
              <Route path="/saved-courses" element={<SavedCoursesPage />} />
              <Route path="/enrolled-courses" element={<EnrolledCoursesPage />} />
              <Route path="/completion-certificates" element={<CompletionCertificatesPage />} />
              <Route path="/verify/:id" element={<CourseCompletionCertificatePage />} />
              <Route path="/verify-lect/:id" element={<LecturerCertificate />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/pricing-and-promotions" element={<PricingPromotionsPage />} />
            {/* </Route> */}

            {/* Routes accessible by Admin only */}
            <Route element={<ProtectedRoute allowedRoles={ADMIN_ONLY_ROLE} />}>
              <Route path="/admin-panel-436" element={<AdminPanelPage />} />
            </Route>

            {/* Routes accessible by Admin and Manager */}
            <Route element={<ProtectedRoute allowedRoles={ADMIN_AND_MANAGER_ROLES} />}>
              <Route path="/manage-lecturers" element={<ManageLecturersPage />} />
              <Route path="/manage-lecturers/add" element={<AddLecturerPage />} />
              <Route path="/manage-lecturers/update/:id" element={<UpdateLecturersPage />} />
              <Route path="/student-subscriptions" element={<UserEnrollmentAndSubscriptionPage />} />
              <Route path="/manage-course" element={<CourseManagementPage />} />
              <Route path="/manage-course/add-main-course" element={<AddNewMainCourse />} />
              <Route path="/manage-course/add-sub-course" element={<AddNewSubCourse />} />
              <Route path="/upload-course-materials" element={<UploadCourseMaterialsPage />} />
              <Route path="/add-course-info" element={<AddCourseInfoPage />} />
              <Route path="/add-module" element={<AddModulePage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
