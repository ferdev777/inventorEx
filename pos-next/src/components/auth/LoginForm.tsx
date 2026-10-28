'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa a tu cuenta de POS</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full py-3"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Contraseña</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full py-3"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full primary-btn py-3.5 text-base font-bold flex items-center justify-center gap-2 group shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Ingresar
              <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-400">
          ¿No tienes cuenta? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
