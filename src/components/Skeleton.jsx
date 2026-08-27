import { cn } from './Button';
import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => {
  return (
    <div className={cn("animate-shimmer bg-gradient-to-r from-bg-tertiary via-bg-elevated to-bg-tertiary bg-[length:200%_100%] rounded-md", className)} />
  );
};

export const PostSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-5 border-b border-border-subtle"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-[140px]" />
          <Skeleton className="h-3 w-[90px]" />
        </div>
      </div>
      <div className="space-y-2.5 mb-5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-3/6" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-xl mb-4" />
      <div className="flex space-x-4 pt-3">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </motion.div>
  );
};
