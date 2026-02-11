import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'fynans',
        path: 'auth/callback',
      });

      const authUrl = `${BACKEND_URL}/api/auth/sign-in/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const userId = url.searchParams.get('userId');
        const email = url.searchParams.get('email');

        if (!token) {
          throw new Error('No token received from authentication');
        }

        return {
          token,
          userId: userId || '',
          email: email || '',
        };
      } else if (result.type === 'cancel') {
        throw new Error('Google Sign In was canceled');
      } else {
        throw new Error('Google Sign In failed');
      }
    } catch (e: any) {
      const errorMessage = e.message || 'Google sign-in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
  };
};
