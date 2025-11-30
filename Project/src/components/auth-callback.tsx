import React, { useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthCallbackProps {
  onSuccess: () => void;
}

export function AuthCallback({ onSuccess }: AuthCallbackProps) {
  useEffect(() => {
    const handleCallback = async () => {
      // Extract token and email from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const email = params.get('email');

      if (token) {
        // Save token
        authService.setToken(token);

        // Verify token with server to get actual user ID
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              console.log('User saved from verify:', data.user);
            }
          } else if (email) {
            // Fallback: use email from URL params
            const user = { email: email };
            localStorage.setItem('user', JSON.stringify(user));
            console.log('User saved from URL params:', user);
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          // Fallback: use email from URL params
          if (email) {
            const user = { email: email };
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        
        // Redirect to main app
        onSuccess();
      } else {
        // No token, redirect to login
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [onSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Completing sign in...</p>
      </div>
    </div>
  );
}
