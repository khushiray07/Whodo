'use client';

import { type InputHTMLAttributes } from 'react';

export function Input({
  label,
  className = '',
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant
          text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary
          focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
