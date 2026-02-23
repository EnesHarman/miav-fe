import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser, isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true);
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = generateState();

      sessionStorage.setItem('pkce_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);

      const authUrl = await authService.getSocialAuthUrl(provider, challenge, state);

      const w = 520;
      const h = 620;
      const left = Math.round((window.screen.width - w) / 2);
      const top = Math.round((window.screen.height - h) / 2);
      const popup = window.open(
        authUrl,
        'miav-oauth',
        `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'OAUTH_SUCCESS') {
          const tokens = event.data.payload;
          if (tokens) {
            authService.setTokens(tokens);
            if (popup && !popup.closed) popup.close();
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            await refreshUser();
          }
        }
        if (event.data?.type === 'OAUTH_ERROR') {
          if (popup && !popup.closed) popup.close();
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          toast.error('Giriş işlemi Sunucu tarafından reddedildi.');
        }
      };

      window.addEventListener('message', handleMessage);

      const checkClosed = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          // If the callback successfully finished and saved tokens via other means
          if (sessionStorage.getItem('accessToken')) {
            await refreshUser(); // This will trigger the context to fetch user, set isAuthenticated to true, and our useEffect above will navigate to /
          }
        }
      }, 500);

    } catch (error) {
      console.error('Failed to initiate login flow:', error);
      toast.error('Giriş işlemi başlatılamadı. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  const handleMockLogin = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('client_id', 'miavify-fe');
      params.append('client_secret', 'WGthCIlmkL2sag61GDt7SuCSQK3OlnsV');
      params.append('grant_type', 'client_credentials');

      const response = await fetch('http://localhost:8180/realms/miav/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error('Keycloak request failed');
      }

      const data = await response.json();
      if (data.access_token) {
        sessionStorage.setItem('accessToken', data.access_token);
        if (data.refresh_token) {
          sessionStorage.setItem('refreshToken', data.refresh_token);
        }
        await refreshUser();
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Mock login failed:', error);
      toast.error('Mock login başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Arka plan tam ekran, form üstte — sol kenarda resmin ucu görünsün, form sağa yapışmasın */}
      <div
        className="absolute inset-0 z-0 hidden bg-no-repeat md:block"
        style={{
          backgroundImage: 'url(/login-bg.png)',
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
        }}
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-md flex-shrink-0 flex-col justify-center bg-[#FDF8F5]/95 px-8 py-12 shadow-xl backdrop-blur-sm md:max-w-lg md:ml-8 md:mr-8 md:px-12 lg:ml-12 lg:mr-12 lg:px-16">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-2 px-0 text-left">
            <img
              src="/logo.png"
              alt="Miav Logo"
              className="mb-2 h-16 w-16 object-contain"
            />
            <CardTitle className="text-2xl font-bold text-[#402E2A]">Welcome to Miav</CardTitle>
            <CardDescription className="text-[#402E2A]/80">Sign in to manage your furry friends</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('google')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#402E2A]/20 bg-white px-4 py-3 text-sm font-medium text-[#402E2A] transition hover:bg-[#402E2A]/5 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#402E2A]" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? 'Yönlendiriliyor...' : 'Sign in with Google'}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('apple')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#402E2A]/20 bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-black/90 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M16.365 1.488c-.022 1.474-.836 2.92-1.933 3.931-1.077 1.002-2.58 1.678-3.955 1.637-.123-1.393.593-2.887 1.616-3.832 1.023-.945 2.502-1.637 3.903-1.736.035.034.341 0 .369 0zM17.915 22.382c-1.39.043-2.58-1.018-4.008-1.018-1.45 0-2.81.996-4.043 1.018-1.313.023-2.502-.857-3.167-1.954-1.638-2.83-2.906-8.204-.906-11.838 1.026-1.85 2.812-2.977 4.708-2.977 1.348 0 2.56.915 3.315.915.753 0 2.13-1.024 3.663-1.024 1.576.024 2.915.748 3.737 1.954-3.193 1.96-2.658 6.574.606 7.914-.73 1.838-1.614 3.96-3.085 6.002-.843 1.196-1.71 2.37-2.82 2.37z" />
                </svg>
              )}
              {isLoading ? 'Yönlendiriliyor...' : 'Sign in with Apple'}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleMockLogin}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#402E2A]/20 bg-gray-100 px-4 py-3 text-sm font-medium text-[#402E2A] transition hover:bg-gray-200 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#402E2A]" />
              ) : null}
              {isLoading ? 'Yönlendiriliyor...' : 'Mock Login'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
