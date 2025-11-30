import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../services/authService';
import { startAuthSync } from '../utils/chromeStorage';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(true);

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await authService.checkBackendHealth();
      setBackendReady(isHealthy);
      setCheckingBackend(false);
      
      // If not ready, keep checking every 5 seconds
      if (!isHealthy) {
        setTimeout(checkBackend, 5000);
      }
    };
    
    checkBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await authService.login(email, password);
      } else {
        authResponse = await authService.register(email, password);
      }

      // Sync with Chrome extension
      if (authResponse && authResponse.user) {
        startAuthSync(authResponse.user);
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6 sm:pt-8">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {isLogin ? 'Welcome to WatSpend' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            {isLogin
              ? 'Sign in to manage your WatCard spending'
              : 'Sign up to start tracking your expenses'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Backend startup warning */}
            {backendReady === false && (
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertDescription className="text-amber-800 dark:text-amber-200 flex items-center gap-2 text-xs sm:text-sm">
                  <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Backend is starting up... Please wait 1-2 minutes. This happens when the server hasn't been used recently.</span>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@uwaterloo.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-10 sm:h-11"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-10 sm:h-11"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 font-semibold"
              disabled={loading || backendReady === false}
            >
              {loading ? 'Please wait...' : backendReady === false ? 'Waiting for backend...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 sm:h-11 font-semibold"
              onClick={handleGoogleLogin}
              disabled={loading || backendReady === false}
            >
              <svg className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="truncate">Sign in with Google</span>
            </Button>

            <div className="text-center text-xs sm:text-sm">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    onClick={() => setIsLogin(false)}
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    onClick={() => setIsLogin(true)}
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
