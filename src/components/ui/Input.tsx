import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, id, onFocus, onBlur, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    const [isFocused, setIsFocused] = useState(false);
    
    return (
      <div className="flex flex-col gap-1.5 w-full mb-5">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`text-sm font-medium transition-colors ${isFocused ? 'text-primary' : 'text-secondary'}`}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center group">
          {leftIcon && (
            <div className={`absolute left-3.5 transition-colors ${isFocused ? 'text-primary' : 'text-tertiary'}`}>
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`
              w-full rounded-lg border-2 bg-surface-primary py-2.5 text-base transition-all duration-200
              outline-none
              disabled:cursor-not-allowed disabled:opacity-50
              hover:border-primary-300
              focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-100)]
              ${error ? '!border-danger-500 focus:shadow-[0_0_0_4px_var(--color-danger-100)]' : 'border-secondary'}
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${className}
            `}
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              color: 'var(--color-text-primary)'
            }}
            {...props}
          />
          {rightIcon && (
            <div className={`absolute right-3.5 transition-colors ${isFocused ? 'text-primary' : 'text-tertiary'}`}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-sm font-medium text-danger animate-fade-in">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
