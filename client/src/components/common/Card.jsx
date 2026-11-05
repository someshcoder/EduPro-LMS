import { cn } from '../../utils/cn';

const Card = ({ children, className = '', hover = false, glass = false }) => (
  <div
    className={cn(
      'rounded-2xl border transition-all duration-200',
      glass
        ? 'bg-white/85 backdrop-blur-md border-[#E2E8F0] shadow-sm'
        : 'bg-white border-[#E2E8F0] shadow-xs',
      hover && 'hover:border-cyan-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-b border-[#F1F5F9]', className)}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={cn('px-6 py-5', className)}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-t border-[#F1F5F9]', className)}>{children}</div>
);

export default Card;
