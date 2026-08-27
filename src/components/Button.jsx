import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ children, variant = 'primary', className, isLoading, ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 hover:brightness-110 border border-accent-400/20",
    secondary: "bg-bg-elevated text-text-primary hover:bg-bg-elevated/80 border border-border-default",
    ghost: "bg-transparent hover:bg-bg-elevated text-text-secondary hover:text-text-primary",
    danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base"
  };

  const sizeClass = props.size ? sizes[props.size] : sizes.md;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={cn(baseStyles, variants[variant], sizeClass, className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin -ml-0.5 mr-2" />
        ) : null}
        {children}
      </span>
    </motion.button>
  );
};
