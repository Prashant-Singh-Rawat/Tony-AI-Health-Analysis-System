import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 12px 30px -10px rgba(0,0,0,0.1)' } : undefined}
      onClick={onClick}
      className={`bg-bg-surface border border-border-subtle rounded-2xl p-6 transition-colors duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
