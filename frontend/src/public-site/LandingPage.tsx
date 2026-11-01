import React from 'react';
import { Store, ShieldCheck, Zap, Server, Cloud, Check, ArrowRight, QrCode } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';

interface LandingPageProps {
  onEnterApp: () => void;
  onRegister: () => void;
}

export function LandingPage({ onEnterApp, onRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg-secondary)]/80 border-b border-[var(--border-primary)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark size={32} className="text-[var(--accent)]" />
          <span className="text-lg font-bold tracking-tight">
            inventor<span className="text-[var(--accent)]">Ex</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onEnterApp}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Ingresar al POS
          </button>
          <button
            onClick={onRegister}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
          >
            Registrar Comercio <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-6 border border-[var(--accent)]/20">
          <Zap className="w-3.5 h-3.5" /> Arquitectura Unificada v2.0
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Punto de Venta e Inventario Inteligente para Comercios Modernos
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-normal">
          Facturación electrónica nativa con ARCA, control de stock multi-almacén y sincronización en la nube o 100% local en tu propia PC.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onRegister}
            className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-white font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-[var(--accent)]/25 flex items-center justify-center gap-3"
          >
            Comenzar Gratis <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onEnterApp}
            className="px-8 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold text-base hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-3"
          >
            Probar Terminal POS
          </button>
        </div>
      </section>

      {/* Plans Comparison Section */}
      <section className="py-20 px-6 bg-[var(--bg-secondary)] border-y border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Elegí cómo querés operar</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Mismo software, dos modalidades adaptadas a la realidad de tu negocio en Argentina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Cloud Plan */}
            <div className="glass-panel p-8 rounded-3xl border border-[var(--accent)]/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                Recomendado
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)]">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">SaaS Cloud</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Para comercios en expansión</p>
                  </div>
                </div>
                <div className="my-6">
                  <span className="text-4xl font-extrabold">$5.000</span>
                  <span className="text-sm text-[var(--text-tertiary)]"> ARS / mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--accent)]" /> Multi-sucursal y multi-cajero</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--accent)]" /> Sincronización en tiempo real (Supabase)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--accent)]" /> Backups automáticos en la nube</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--accent)]" /> Facturación ARCA ilimitada</li>
                </ul>
              </div>
              <button
                onClick={onRegister}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all text-center shadow-md"
              >
                Elegir Cloud
              </button>
            </div>

            {/* Local Plan */}
            <div className="glass-panel p-8 rounded-3xl border border-[var(--border-primary)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Licencia Local</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Para equipos modestos (Equivalente Offline)</p>
                  </div>
                </div>
                <div className="my-6">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-sm text-[var(--text-tertiary)]"> / binario autónomo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Corre 100% offline en tu PC (SQLite)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Sin abonos mensuales ni comisiones ocultas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Consumo mínimo (~25 MB RAM)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Facturación ARCA con certificado local</li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] font-bold text-[var(--text-primary)] hover:bg-[var(--border-primary)] transition-all text-center"
              >
                Descargar Binario (.exe)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Integration Info */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h3 className="text-xl font-bold mb-4">Pagos seguros y sin retenciones abusivas</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
          Soporte para Débito Directo CBU / DEBIN y Transferencias 3.0 (QR Interoperable) con comisiones mínimas del 0.5% frente al 5.5% de tarjetas tradicionales.
        </p>
        <div className="flex justify-center gap-6 opacity-60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><QrCode className="w-4 h-4" /> Transferencias 3.0</div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><ShieldCheck className="w-4 h-4" /> ARCA Compliance</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-[var(--border-primary)] text-xs text-[var(--text-tertiary)]">
        inventorEx Architecture v2.0 • Diseñado para operar sin depender de la nube.
      </footer>
    </div>
  );
}
