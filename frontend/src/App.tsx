import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Глобальные стили
import './index.css';
import './styles/global.css';
import './components/common/Header.css';
import './components/common/Footer.css';

// Компоненты
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Страницы
import HomePage from './components/pages/HomePage';
import AboutUsPage from './components/pages/AboutUsPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';
import CourseDetailPage from './components/pages/CourseDetailPage';
import CourseListPage from './components/pages/CourseListPage';
import CreateCoursePage from './components/pages/CreateCoursePage';
import CreatedCoursesPage from './components/pages/CreatedCoursesPage';
import EditCoursePage from './components/pages/EditCoursePage';
import FAQPage from './components/pages/FAQPage';
import LessonDetailPage from './components/pages/LessonDetailPage';
import LoginPage from './components/pages/LoginPage';
import MyCoursesPage from './components/pages/MyCoursesPage';
import ProfilePage from './components/pages/ProfilePage';
import PurchasedCoursesPage from './components/pages/PurchasedCoursesPage';
import RegisterPage from './components/pages/RegisterPage';
import RecycleBinPage from './components/pages/RecycleBinPage';
import SavedCoursesPage from './components/pages/SavedCoursesPage';
import TermsAndConditionsPage from './components/pages/TermsAndConditionsPage';

// Описать пропсы для обёртки страниц
interface PageWrapperProps {
    children: ReactNode;
}

/**
 * Отрисовать обёртку для страниц с Header и Footer.
 */
const PageWrapper = ({ children }: PageWrapperProps): React.JSX.Element => {
    return (
        <>
            <Header />
            <main className="main">
                {children}
            </main>
            <Footer />
        </>
    );
};

/**
 * Отрисовать защищённый маршрут (только авторизованные).
 */
const ProtectedRoute = ({ children }: PageWrapperProps): React.JSX.Element => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * Отрисовать публичный маршрут (редирект на главную, если уже авторизован).
 */
const PublicRoute = ({ children }: PageWrapperProps): React.JSX.Element => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }
    return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

/**
 * Отрисовать основные маршруты приложения.
 */
function AppRoutes(): React.JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/aboutUs" element={<PageWrapper><AboutUsPage /></PageWrapper>} />
            <Route path="/courses" element={<PageWrapper><CourseListPage /></PageWrapper>} />
            <Route path="/courses/:id" element={<PageWrapper><CourseDetailPage /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsAndConditionsPage /></PageWrapper>} />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <PageWrapper><ProfilePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/change-password" element={
                <ProtectedRoute>
                    <PageWrapper><ChangePasswordPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/my-courses" element={
                <ProtectedRoute>
                    <PageWrapper><MyCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/saved-courses" element={
                <ProtectedRoute>
                    <PageWrapper><SavedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/purchased-courses" element={
                <ProtectedRoute>
                    <PageWrapper><PurchasedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/recycle-bin" element={
                <ProtectedRoute>
                    <PageWrapper><RecycleBinPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/create-course" element={
                <ProtectedRoute>
                    <PageWrapper><CreateCoursePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/created-courses" element={
                <ProtectedRoute>
                    <PageWrapper><CreatedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/edit-course/:id" element={
                <ProtectedRoute>
                    <PageWrapper><EditCoursePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/lessons/:lessonId" element={
                <ProtectedRoute>
                    <PageWrapper><LessonDetailPage /></PageWrapper>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/**
 * Отрисовать корневой компонент приложения.
 */
function App(): React.JSX.Element {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;