import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#1E293B]">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'w-full bg-white border rounded-xl text-[#1E293B] placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-[#06B6D4]',
            'transition-all duration-200 shadow-xs',
            'disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed',
            error ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-[#E2E8F0]',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            'py-2.5 text-sm',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
