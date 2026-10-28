'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

interface PeriodSelectorProps {
  value: 'day' | 'week' | 'month' | 'year';
  onChange: (period: 'day' | 'week' | 'month' | 'year') => void;
}

const PERIODS = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
  { value: 'year', label: 'Este Año' },
] as const;

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedLabel = PERIODS.find((p) => p.value === value)?.label;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
          border border-transparent hover:border-[var(--border-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20
        `}
        style={{
          color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
          backgroundColor: isOpen ? 'var(--bg-elevated)' : 'transparent',
          boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <Calendar className="w-3.5 h-3.5 opacity-70" />
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 z-50 rounded-xl shadow-xl overflow-hidden animate-fade-in-up origin-top-right"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="p-1">
            {PERIODS.map((period) => {
              const isSelected = value === period.value;
              return (
                <button
                  key={period.value}
                  onClick={() => {
                    onChange(period.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150
                    ${isSelected ? 'font-semibold' : 'font-medium'}
                  `}
                  style={{
                    backgroundColor: isSelected ? 'var(--input-focus-ring)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    {period.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
