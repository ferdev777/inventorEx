'use client';

import { useState, ReactNode } from 'react';
import { AlertTriangle, Info, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class merging

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    if (isLoading || isSuccess) return;

    setIsLoading(true);
    try {
      await onConfirm();
      setIsLoading(false);
      setIsSuccess(true);
      
      // Close after a brief delay to show success state
      setTimeout(() => {
        onClose();
        // Reset states after close animation would finish
        setTimeout(() => {
          setIsSuccess(false);
        }, 300);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      // Keep modal open on error so user can retry or cancel
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // Fallback or use variable if defined
    >
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4",
              variant === 'danger' ? "bg-red-500/10 text-red-500" : "bg-[var(--accent)]/10 text-[var(--accent)]"
            )}
          >
            {variant === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>

          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            {title}
          </h3>

          <div className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            {description}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={loading || isLoading || isSuccess}
              className="flex-1 py-2.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/80 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || isLoading || isSuccess}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-white font-medium text-sm transition-all flex items-center justify-center gap-2",
                isSuccess 
                  ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
                  : variant === 'danger'
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                    : "bg-[var(--accent)] hover:brightness-110 shadow-lg shadow-[var(--accent)]/20"
              )}
            >
              {isLoading || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSuccess ? (
                <Check className="w-4 h-4" />
              ) : null}
              
              {isLoading || loading ? 'Procesando...' : isSuccess ? '¡Confirmado!' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
