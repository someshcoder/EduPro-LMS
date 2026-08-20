import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    primary: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
