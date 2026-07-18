import { cn } from './Button';
import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-white/10 rounded-md", className)} />
  );
};

export const PostSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white/5 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/5 mb-8"
    >
      <div className="flex items-center space-x-4 mb-5">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[160px] bg-white/10" />
          <Skeleton className="h-3 w-[100px] bg-white/5" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5" />
        <Skeleton className="h-4 w-4/6 bg-white/5" />
      </div>
      <Skeleton className="h-[350px] w-full rounded-2xl mb-5 bg-white/5" />
      <div className="flex space-x-4 border-t border-white/5 pt-4">
        <Skeleton className="h-8 w-20 bg-white/5" />
        <Skeleton className="h-8 w-20 bg-white/5" />
      </div>
    </motion.div>
  );
};
