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
    debugger;
    const params = new URLSearchParams(window.location.search);
    const accessToken =
      params.get('accessToken') ?? params.get('access_token');
    const refreshToken =
      params.get('refreshToken') ?? params.get('refresh_token');
      console.log("aaaaa" + params.toString())
    if (!accessToken || !refreshToken) {
      setError('Giriş tamamlanamadı. Token bilgisi alınamadı.');
      toast.error('Google ile giriş tamamlanamadı.');
      return;
    }

    authService.setTokens({ accessToken, refreshToken, tokenType: 'Bearer' });
    toast.success('Giriş başarılı!');

    if (window.opener) {
      window.opener.location.href = '/';
      setTimeout(() => window.close(), 100);
    } else {
      window.location.href = '/';
    }
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
