import { cn } from '../../utils/cn';

const Card = ({ children, className = '', hover = false, glass = false }) => (
  <div
    className={cn(
      'rounded-2xl border',
      glass
        ? 'bg-white/5 backdrop-blur-sm border-white/10'
        : 'bg-slate-800/50 border-slate-700/50',
      hover && 'hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer',
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-b border-slate-700/50', className)}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={cn('px-6 py-5', className)}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-t border-slate-700/50', className)}>{children}</div>
);

export default Card;
