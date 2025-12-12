import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-center max-w-sm">{description}</p>
    </motion.div>
  );
}