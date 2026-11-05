import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 text-white shadow-md shadow-cyan-500/20 focus:ring-cyan-400',
    secondary: 'bg-white hover:bg-slate-50 text-[#1E293B] border border-[#E2E8F0] shadow-xs focus:ring-slate-300',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-rose-500/20 focus:ring-rose-400',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-400',
    ghost: 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-[#06B6D4] text-[#06B6D4] hover:bg-cyan-50/50 focus:ring-cyan-400',
    warning: 'bg-gradient-to-r from-[#FDBA74] to-[#FB7185] hover:opacity-95 text-white shadow-md shadow-orange-500/20 focus:ring-orange-400',
    reward: 'bg-gradient-to-r from-[#8B5CF6] to-[#FB7185] hover:opacity-95 text-white shadow-md shadow-purple-500/20 focus:ring-purple-400',
  };

  const sizes = {
    xs: 'text-xs px-3 py-1.5',
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
