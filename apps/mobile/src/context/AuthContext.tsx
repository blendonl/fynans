import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authControllerLogin, authControllerRegister, authControllerLogout, authControllerMe } from '../api/generated/endpoints/auth/auth';
import type { MeResponseDto, LoginRequestDto, RegisterRequestDto } from '../api/generated/model';

interface SocialAuthData {
    token: string;
    userId: string;
    email: string;
}

interface AuthContextType {
    user: MeResponseDto | null;
    token: string | null;
    isLoading: boolean;
    login: (data: LoginRequestDto) => Promise<void>;
    register: (data: RegisterRequestDto) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: (data: SocialAuthData) => Promise<void>;
    loginWithApple: (data: SocialAuthData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<MeResponseDto | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                // Optionally fetch user profile here if needed, or just decode token if it was JWT with user info
                // For now let's try to fetch 'me'
                try {
                    const { data: userData } = await authControllerMe();
                    setUser(userData);
                } catch (e) {
                    // Token might be invalid
                    await AsyncStorage.removeItem('token');
                    setToken(null);
                }
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginRequestDto) => {
        const { data: res } = await authControllerLogin(data);
        if (res.token) {
            setToken(res.token);
            setUser(res.user);
            await AsyncStorage.setItem('token', res.token);
        }
    };

    const register = async (data: RegisterRequestDto) => {
        const { data: res } = await authControllerRegister(data);
        if (res.token) {
            setToken(res.token);
            setUser(res.user);
            await AsyncStorage.setItem('token', res.token);
        }
    };

    const logout = async () => {
        try {
            await authControllerLogout();
        } catch (e) {
            // ignore
        }
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
    };

    const loginWithGoogle = async (data: { token: string; userId: string; email: string }) => {
        if (data.token) {
            setToken(data.token);
            await AsyncStorage.setItem('token', data.token);
            try {
                const { data: userData } = await authControllerMe();
                setUser(userData);
            } catch (e) {
                console.error('Failed to fetch user data after Google login', e);
            }
        }
    };

    const loginWithApple = async (data: { token: string; userId: string; email: string }) => {
        if (data.token) {
            setToken(data.token);
            await AsyncStorage.setItem('token', data.token);
            try {
                const { data: userData } = await authControllerMe();
                setUser(userData);
            } catch (e) {
                console.error('Failed to fetch user data after Apple login', e);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, loginWithGoogle, loginWithApple }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
