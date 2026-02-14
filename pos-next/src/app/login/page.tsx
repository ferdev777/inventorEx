import { LoginForm } from '@/components/auth/LoginForm';
import { Store } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-[#0f1115] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 bg-accent rounded-xl shadow-lg shadow-accent/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">INVENTOREX</h2>
            <p className="text-[10px] font-bold text-accent tracking-[0.2em] mt-0.5 uppercase">Premium POS System</p>
          </div>
        </div>

        <LoginForm />
        
        <p className="mt-8 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} InventorEx - Sistema de Gestión
        </p>
      </div>
    </main>
  );
}
