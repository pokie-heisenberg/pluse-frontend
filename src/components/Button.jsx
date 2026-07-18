import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ children, variant = 'primary', className, isLoading, ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030303] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-primary-400/20",
    secondary: "bg-white/5 backdrop-blur-md text-white hover:bg-white/10 border border-white/10 shadow-lg",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-400/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  const sizeClass = props.size ? sizes[props.size] : sizes.md;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(baseStyles, variants[variant], sizeClass, className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Animated Gradient Overlay for Primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
      )}
      
      <span className="relative z-10 flex items-center">
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </span>
    </motion.button>
  );
};
