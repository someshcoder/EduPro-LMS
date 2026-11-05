import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-[#64748B] border-slate-200',
    primary: 'bg-cyan-50 text-[#06B6D4] border-cyan-200/70',
    purple: 'bg-purple-50 text-[#8B5CF6] border-purple-200/70',
    reward: 'bg-rose-50 text-[#FB7185] border-rose-200/70',
    orange: 'bg-orange-50 text-orange-600 border-orange-200/70',
    success: 'bg-[#D1FAE5] text-[#065F46] border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-600 border-rose-200/70',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
    info: 'bg-sky-50 text-sky-700 border-sky-200/70',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
