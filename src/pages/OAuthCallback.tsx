import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * OAuth callback sayfası: Backend bu URL'e yönlendirir (örn. /oauth2/redirect?accessToken=...&refreshToken=...).
 * Token'ları URL'den alıp saklar ve ana sayfaya yönlendirir.
 */
export default function OAuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const verifier = sessionStorage.getItem('pkce_verifier');
        debugger
        if (!code || !verifier) {
          setError('Giriş tamamlanamadı. Eksik parametreler.');
          toast.error('Giriş tamamlanamadı.');
          return;
        }

        const tokens = await authService.handleCallback(code, verifier);
        sessionStorage.removeItem('pkce_verifier');
        sessionStorage.removeItem('oauth_state');

        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', payload: tokens }, window.location.origin);
          setTimeout(() => window.close(), 100);
        } else {
          authService.setTokens(tokens);
          toast.success('Giriş başarılı!');
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Giriş tamamlanamadı. Sunucu hatası.');
        toast.error('Giriş işlemi başarısız.');

        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_ERROR' }, window.location.origin);
          setTimeout(() => window.close(), 100);
        }
      }
    };

    processCallback();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FDF8F5] px-4">
        <p className="text-center text-[#402E2A]/80">{error}</p>
        <a
          href="/login"
          className="rounded-xl bg-[#E67E66] px-4 py-2 font-medium text-white hover:bg-[#E67E66]/90"
        >
          Giriş sayfasına dön
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FDF8F5] px-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#E67E66]" />
      <p className="text-[#402E2A]/80">Giriş tamamlanıyor...</p>
    </div>
  );
}
