import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

// Описываем типы возвращаемых значений для функций
export interface AuthResponse {
    success: boolean;
    error?: string;
    message?: string;
    user?: User;
}

export interface UpdateProfileResponse {
    success: boolean;
    error?: any;
    user?: User;
}

// Описываем интерфейс самого контекста
interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>;
    register: (userData: any) => Promise<AuthResponse>; // userData можно типизировать точнее, если есть тип RegisterForm
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<UpdateProfileResponse>;
    updateAvatar: (file: File) => Promise<UpdateProfileResponse>;
    changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<AuthResponse>;
    deleteAccount: () => Promise<AuthResponse>;
}

// Создаем контекст с возможным undefined (проверка будет в useAuth)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Типизируем пропсы провайдера
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Загрузка профиля при монтировании
    useEffect(() => {
        const loadUser = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                // Указываем, что ожидаем ответ типа User
                const response = await api.get<User>('/auth/profile/');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Слушаем событие выхода (из перехватчика Axios)
        const handleLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
        };
        window.addEventListener('auth-logout', handleLogout);
        return () => window.removeEventListener('auth-logout', handleLogout);
    }, []);

    // Функция входа
    const login = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/login/', {
                username_or_email: usernameOrEmail,
                password
            });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const userResponse = await api.get<User>('/auth/profile/');
            setUser(userResponse.data);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error: any) {
            const message = error.response?.data?.non_field_errors?.[0] || 'Invalid username/email or password';
            return { success: false, error: message };
        }
    };

    // Функция регистрации
    const register = async (userData: any): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/register/', userData);
            const { user: registeredUser, message } = response.data;

            // После регистрации автоматически входим
            const loginResult = await login(userData.email, userData.password);
            if (loginResult.success) {
                return { success: true, user: registeredUser, message };
            }
            return { success: false, error: 'Ошибка автоматического входа после регистрации' };
        } catch (error: any) {
            const errors = error.response?.data || {};

            // Безопасно вытаскиваем первую ошибку валидации от DRF
            const firstErrorKey = Object.keys(errors)[0];
            const firstError = firstErrorKey ? errors[firstErrorKey][0] : 'Ошибка регистрации';

            return { success: false, error: firstError };
        }
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Обновление профиля
    const updateProfile = async (data: Partial<User>): Promise<UpdateProfileResponse> => {
        try {
            const response = await api.patch<User>('/auth/profile/', data);
            setUser(response.data);
            return { success: true, user: response.data };
        } catch (error: any) {
            return { success: false, error: error.response?.data };
        }
    };

    // Обновление аватара
    const updateAvatar = async (file: File): Promise<UpdateProfileResponse> => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.patch<User>('/auth/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser(response.data);
            return { success: true, user: response.data };
        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            return { success: false, error: error.response?.data };
        }
    };

    // Смена пароля
    const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/change-password/', {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            return { success: true, message: response.data.message };
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to change password';
            return { success: false, error: message };
        }
    };

    // Удаление аккаунта
    const deleteAccount = async (): Promise<AuthResponse> => {
        try {
            const response = await api.delete('/auth/delete-account/');
            return { success: true, message: response.data.message };
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to delete account';
            return { success: false, error: message };
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        changePassword,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};